import express from 'express';
import { 
    convertVideo, 
    deleteProcessedVideo, 
    deleteRawVideo, 
    deleteThumbnail, 
    downloadRawVideo, 
    setupDirectories, 
    uploadProcessedVideo,
    uploadThumbnail
} from './googleCloudStorage';
import { isVideoNew, setVideo } from './firestore';

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try{
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload recieved')
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad request. No Filename')
    }

    const inputFileName = data.name; // Format of <UID>-<DATE>.<EXTENSION>
    const outputFileName = `processed-${inputFileName}`;
    const videoID = inputFileName.split('.')[0];

    if (!isVideoNew(videoID)) {
        return res.status(400).send('Bad Request: Video is already processing or processed');
    }else {
        await setVideo(videoID,  {
            id: videoID,
            uid: videoID.split("-")[0],
            status: 'processing'
        });
    }

    // get the raw file from storage
    await downloadRawVideo(inputFileName);

    // Video Converting
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        // Removing files in case of a fail
        await Promise.all([
        deleteRawVideo(inputFileName),
        deleteThumbnail(inputFileName),
        deleteProcessedVideo(outputFileName)
        ])

        console.log(err);
        return res.status(500).send('Internal server error: Video processing failed');
    }

    // upload the processed video and thumbnail in storage
    await uploadProcessedVideo(outputFileName);
    await uploadThumbnail(inputFileName);


    await setVideo(videoID, {
        status: 'processed', 
        filename: outputFileName,
        thumbnailPath: inputFileName.split('.')[0] + '.png',
    })

    // Deleting Videos when finished
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
        ])
    
    return res.status(200).send('Upload successfull')
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(
        `Video processing service listening at port ${port}`
    )
});
