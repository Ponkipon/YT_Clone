import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "mytclone-raw-videos";
const processedVideoBucketName = "mytclone-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Function to create local directories for raw and processed videos
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}


/** 
*  @param rawVideoName - name of the file to convert from {@link localRawVideoPath}
*  @param proccesedVideoName - name of the file to convert to {@link localProcessedVideoPath}
*  @returns - A promise that resolves when the video has been converted
*/
export function convertVideo(rawVideoName: string, proccesedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .size('360x640') // convert recieved video to 360p
        .on("end", function() {
            console.log("Video Processing Complete");
            resolve();
        })
        .on("error", function(error) {
            console.log(`An Error Occured while processing the video.\n Error Message:${error.Message}`);
            reject(error);
        })
        .save(`${localProcessedVideoPath}/${proccesedVideoName}`);
        
    });
}

/**
 * @param fileName - name of the file to download from
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder
 * @returns - A promise that's resolved when the file is downloaded  
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({destination: `${localRawVideoPath}/${fileName}`});
    
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`
    )
    
}


/**
* @param fileName - name of the file to upload from the
* {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName} folder
* @returns - A promise that's resolved when the file is uploaded   
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );

    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - name of a file that needs to be deleted from
 * {@link localRawVideoPath} folder
 * @returns A promise that resolves when the file is deleted
 */
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`)
}

/**
 * @param fileName - name of a file that needs to be deleted from
 * {@link localProcessedVideoPath} folder
 * @returns A promise that resolves when the file is deleted
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}


/**
 * @param filePath - Path of a file to delete
 * @returns - A promise that resolves when the file has been deleted
 */
function deleteFile(filePath: string): Promise <void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err){
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File ${filePath} was deleted`)
                    resolve();
                }
            })
        } else {
            console.log(`File ${filePath} does not exist`);
            resolve();
        }
    });
}

/**
 * 
 * @param dirPath - path of a directory to check
 */
function ensureDirectoryExistence(dirPath: string) {
    if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true}); // recursive: true allows to create nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}