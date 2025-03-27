# YT_Clone
My own video hosting

This service automatically processes videos uploaded to a Google Cloud Storage bucket, converts them to a web-friendly format (360p), generates a thumbnail, and updates a Firestore database with the video metadata. It's designed to be deployed as a Cloud Run service triggered by Pub/Sub messages.

## Overview

The service performs the following tasks:

1.  **Receives Pub/Sub Message:**  Listens for messages from a Pub/Sub topic, triggered when a new video is uploaded to the raw video storage bucket.
2.  **Downloads Raw Video:** Downloads the raw video file from the designated Google Cloud Storage bucket.
3.  **Converts Video:** Uses FFmpeg to convert the video to a 360p resolution, optimized for web streaming.
4.  **Generates Thumbnail:** Creates a thumbnail image from the converted video.
5.  **Uploads Processed Video and Thumbnail:** Uploads the processed video and thumbnail to their respective Google Cloud Storage buckets, making them publicly accessible.
6.  **Updates Firestore:** Updates a Firestore database with metadata about the processed video, including its status, filename, and thumbnail path.
7.  **Cleans Up:** Deletes the raw video from the raw video bucket and deletes the local temporary files (raw video, processed video, and thumbnail).

## Architecture

*   **Trigger:** Pub/Sub message triggered by object creation in a Google Cloud Storage bucket.
*   **Runtime:** Node.js
*   **Deployment:** Google Cloud Run
*   **Storage:** Google Cloud Storage
*   **Database:** Firestore
*   **Video Processing:** FFmpeg

## Prerequisites

Before deploying this service, ensure you have the following:

*   A Google Cloud project with billing enabled.
*   The Google Cloud SDK (gcloud) installed and configured.
*   Firebase CLI installed (`npm install -g firebase-tools`).
*   Three Google Cloud Storage buckets:
    *   `mytclone-raw-videos`:  For storing raw, uploaded videos.
    *   `mytclone-processed-videos`: For storing processed videos.
    *   `mytclone-thumbnails`: For storing generated thumbnails.
*   A Firestore database instance in your Google Cloud project.
*   A Pub/Sub topic to trigger the Cloud Run service (configured to receive object creation events from the raw video bucket).
*   Service account with appropriate permissions to access Cloud Storage, Firestore, and Pub/Sub.

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone [<repository_url>](https://github.com/Ponkipon/YT_Clone/)
    cd video-processing-service
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Firebase Admin SDK:**

    The service uses the Firebase Admin SDK to interact with Firestore.  It's configured to use the application default credentials.  Ensure that your environment is configured to provide these credentials.  The easiest way to do this in a Google Cloud environment is to let the service account be configured automatically.  For local development, you can use the following:

    *   Create a service account in the Firebase console.
    *   Download the service account key file (JSON).
    *   Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the key file:

    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
    ```

4.  **Set environment variables:**

    Configure the following environment variables for your Cloud Run service.  You can do this through the Cloud Console or using the `gcloud` command-line tool.

    *   `PORT`:  The port the service listens on (usually `3000`).
    *   `NODE_ENV`: Set to `production` for production environments.
    *   `PUBSUB_TOPIC`: The name of the Pub/Sub topic that triggers the service. (e.g. `video-uploaded-topic`)
    *   `RAW_VIDEO_BUCKET_NAME`: The name of the bucket where raw videos are uploaded (e.g., `mytclone-raw-videos`).
    *   `PROCESSED_VIDEO_BUCKET_NAME`: The name of the bucket where processed videos are stored (e.g., `mytclone-processed-videos`).
    *   `THUMBNAILS_BUCKET_NAME`: The name of the bucket where video thumbnails are stored (e.g., `mytclone-thumbnails`).

5.  **Build the service:**

    ```bash
    npm run build
    ```

6.  **Deploy to Cloud Run:**

    Deploy the service to Cloud Run using the following command. Replace `<YOUR_PROJECT_ID>` with your Google Cloud project ID and `<YOUR_PUBSUB_TOPIC>` with your Pub/Sub topic name.  Adjust the memory and CPU settings as needed.

    ```bash
    gcloud run deploy video-processing-service \
      --image gcr.io/<YOUR_PROJECT_ID>/video-processing-service \
      --region <YOUR_REGION> \
      --platform managed \
      --allow-unauthenticated \
      --memory 4Gi \
      --cpu 2 \
      --set-env-vars PORT=3000,NODE_ENV=production,PUBSUB_TOPIC=<YOUR_PUBSUB_TOPIC>,RAW_VIDEO_BUCKET_NAME=mytclone-raw-videos,PROCESSED_VIDEO_BUCKET_NAME=mytclone-processed-videos,THUMBNAILS_BUCKET_NAME=mytclone-thumbnails
    ```

    You will need to build and push the docker image first:

    ```bash
    gcloud builds submit --tag gcr.io/<YOUR_PROJECT_ID>/video-processing-service
    ```

    *Important:* Make sure the service account used by Cloud Run has the necessary permissions to access Cloud Storage, Firestore, and the Pub/Sub topic.

## Configuration

The following environment variables can be configured to customize the service's behavior:

*   `PORT`: The port the service listens on (default: 3000).
*   `NODE_ENV`: Set to `production` for production environments.
*   `PUBSUB_TOPIC`: The name of the Pub/Sub topic that triggers the service.
*   `RAW_VIDEO_BUCKET_NAME`: The name of the bucket where raw videos are uploaded (default: `mytclone-raw-videos`).
*   `PROCESSED_VIDEO_BUCKET_NAME`: The name of the bucket where processed videos are stored (default: `mytclone-processed-videos`).
*   `THUMBNAILS_BUCKET_NAME`: The name of the bucket where video thumbnails are stored (default: `mytclone-thumbnails`).

## Code Structure

*   `src/index.ts`:  The main entry point of the service.  Handles the Pub/Sub message, orchestrates the video processing steps, and sets up the Express server.
*   `src/googleCloudStorage.ts`: Contains functions for interacting with Google Cloud Storage, including downloading, uploading, and deleting video files and thumbnails.
*   `src/firestore.ts`: Contains functions for interacting with Firestore, including setting and updating video metadata.
*   `utils/gcs-cors.json`: Example JSON to configure CORS settings on your GCS bucket.
*   `tsconfig.json`: TypeScript configuration file.

## Local Development

For local development, you can use the Firestore and Storage emulators.

1.  **Start the emulators:**

    ```bash
    firebase emulators:start
    ```

2.  **Set the Firestore host:**

    Uncomment the code in `src/firestore.ts` to configure the Firestore client to connect to the emulator:

    ```typescript
    if (process.env.NODE_ENV !== 'production') {
        firestore.settings({
            host: "localhost:8080", // Default port for Firestore emulator
            ssl: false
        });
    }
    ```

3.  **Run the service locally:**

    ```bash
    npm run start
    ```

    You can then trigger the service by sending a POST request to `http://localhost:3000/process-video` with a JSON payload containing the filename of the video to process.  You'll also need to configure a local Pub/Sub emulator if you want to test the full message-driven flow.

## Important Notes

*   **Error Handling:** The service includes basic error handling, but you should enhance it to handle various failure scenarios, such as invalid video files, storage access errors, and FFmpeg processing errors.
*   **Security:** Ensure that your Google Cloud Storage buckets have appropriate access controls to prevent unauthorized access to your video files.
*   **Scaling:** Cloud Run automatically scales the service based on demand. However, you may need to adjust the memory and CPU settings based on the complexity and volume of video processing tasks.
*   **CORS Configuration:** Ensure that your GCS buckets are configured with CORS to allow access from your front-end application.  An example `utils/gcs-cors.json` is included.

## Planned Improvements

*   **Advanced Video Processing:** Implement more advanced video processing techniques, such as adaptive bitrate streaming, watermarking, and scene detection.
*   **More Robust Error Handling:** Add more comprehensive error handling and logging to improve the service's reliability.
*   **Monitoring and Alerting:** Integrate with Google Cloud Monitoring and Alerting to monitor the service's performance and receive alerts in case of errors.
*   **Queueing System:** Implement a queueing system (e.g., Cloud Tasks) to handle a large volume of video processing requests more efficiently.
*   **More Thumbnail Options:** Allow users to select a specific timestamp for the thumbnail.
*   **Input Validation:** Add more comprehensive input validation to the Pub/Sub message to prevent processing invalid files.
```
