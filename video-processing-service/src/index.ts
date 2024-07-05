import express from 'express';
import { 
    convertVideo, 
    deleteProcessedVideo, 
    deleteRawBucketVideo, 
    deleteRawVideo, 
    deleteThumbnail, 
    downloadRawVideo, 
    setupDirectories, 
    uploadProcessedVideo,
    uploadThumbnail
} from './googleCloudStorage';
import { checkVideoEntryInDB, rollbackStatusOnProcessingFail, setFirestoreMetadata } from './firestore';

setupDirectories();

const app = express();
app.use(express.json());


app.post("/process-video", async (req, res) => {    
    console.log(`started working`); 

    let data;
    try{
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload recieved');
        }
    } catch (error) {
        console.error(error);
        res.status(400).send('Bad request. No filename');
    }

    const inputFileName = data.name; // Format of <UID>-<DATE>.<EXTENSION>
    const outputFileName = `processed-${inputFileName}`;
    const videoID = inputFileName.split('.')[0];

    console.log('Data recieved. Starting video processing');
    if (!checkVideoEntryInDB(videoID)) {
        console.log('Bad Request: Video is already processing or processed');
        return res.status(400).send("Bad Request. Video is already processing or already processed");
    } else {
        console.log('Updating DB entries...');
        await setFirestoreMetadata(videoID,  {
            id: videoID,
            uid: videoID.split("-")[0],
            status: 'processing'
        });
        console.log('done');
    };
    console.log('Downloading from raw bucket...');
    // get the raw file from storage
    try{
        await downloadRawVideo(inputFileName);
    } catch (error) {
        console.error(error);
        return res.status(404).send('no video found in raw bucket');
    }
    console.log('converting video');
    // Video Converting
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (error) {
        // Removing files in case of a fail
        await Promise.all([
        deleteRawVideo(inputFileName),
        deleteThumbnail(inputFileName),
        deleteProcessedVideo(outputFileName),
        rollbackStatusOnProcessingFail(videoID),
        ]);
        console.log(error);
        return res.status(500).send("Internal server error. Video processing failed.");
    }
    
    console.log('Processing Complete. Strating upload and cleanup');
    // upload the processed video and thumbnail in storage
    await Promise.all([
        uploadProcessedVideo(outputFileName),
        uploadThumbnail(inputFileName),
    ])
    
    console.log('Updating DB entries');
    await setFirestoreMetadata(videoID, {
        status: 'processed', 
        filename: outputFileName,
        thumbnailPath: inputFileName.split('.')[0] + '.png',
    })

    // Deleting Videos when finished
    console.log('final cleanup...');
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName),
        deleteThumbnail(inputFileName),
        deleteRawBucketVideo(inputFileName)
        ]);

    console.log('Video processed and uploaded successfully');
    return res.status(200).send("Video processing complete");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(
        `Video processing service listening at port ${port}`
    );
});
