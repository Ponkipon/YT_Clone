import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import { removeVideo } from "./firestore";

const storage = new Storage();

const rawVideoBucketName = "mytclone-raw-videos";
const processedVideoBucketName = "mytclone-processed-videos";
const thumbnailsBucketName = "mytclone-thumbnails";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";
const localThumbnailPath = "./thumbnails/"

/**
 * Function to create local directories for raw and processed videos, and thumbnails
 */
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
    ensureDirectoryExistence(localThumbnailPath);
}


/** 
*  @param rawVideoName - name of the file to convert from {@link localRawVideoPath}
*  @param proccesedVideoName - name of the file to convert to {@link localProcessedVideoPath}
*  @returns - A promise that resolves when the video has been converted
*/
export function convertVideo(rawVideoName: string, proccesedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .screenshot({
            timestamps: ['50%'],
            filename: '%b',
            folder: localThumbnailPath,
            size: '320x240' 
        })        
        .on('filenames', function(filenames) {
            console.log('screenshots saved to: ', localThumbnailPath + filenames.join(', '))
        })
        .on("end", function() {
            console.log(`Thumbnail Created`);
        });

        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .fps(30) // also no idea if 30 fps worth it, will need a HUGE rework later 
        .size('360x?') //TODO: Rework || convert recieved video to 360p, I don't know if it's the right way. Playing with compression for now
        .addOptions(["-crf 28"])
        .on("end", function() {
            console.log("Video Processing Complete");
            resolve();
        })
        .on("error", function(error) {
            const videoID = rawVideoName.split('.')[0];
            removeVideo(videoID);
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
 * 
 * @param fileName - name of the file to upload from the
 * {@link localThumbnailPath} folder into the {@link thumbnailsBucketName} folder
 * 
 */
export async function uploadThumbnail(fileName: string) {

    const bucket = storage.bucket(thumbnailsBucketName);
    const thumbnailName = fileName.split('.')[0] + '.png'

    await bucket.upload(`${localThumbnailPath}${thumbnailName}`, {
        destination: thumbnailName
    });

    console.log(
        `Thumbnail ${localThumbnailPath}/${thumbnailName} uploaded to gs://${thumbnailsBucketName}/${thumbnailName}`
    );

    await bucket.file(thumbnailName).makePublic();
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

export function deleteThumbnail(fileName: string) {
    const thumbnailName = fileName.split('.')[0] + '.png'
    return deleteFile(`${localThumbnailPath}/${thumbnailName}`)
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