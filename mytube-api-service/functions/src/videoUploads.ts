import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import {Firestore} from "firebase-admin/firestore";

const storage = new Storage();
const rawVideoBucketName = "mytclone-raw-videos";
const firestore = new Firestore();

// SENDS VIDEO METADATA AS WELL
export const generateUploadURL = onCall({maxInstances: 1}, async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "the function must be called while authenticated"
    );
  }
  const auth = request.auth;
  const data = request.data;

  if (!data.title) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a title"
    );
  }

  const bucket = storage.bucket(rawVideoBucketName);
  // Generate a unique filename for a file to upload
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  const videoID = fileName.split(".")[0];
  // Get a V4 signed URL for uploading a file

  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 60 * 1000, // 1 minute
  });

  const videoMetadata = {
    id: videoID,
    userid: auth.uid,
    title: data.title,
  };

  await firestore
    .collection("videos")
    .doc(videoID)
    .set(videoMetadata, {merge: true});

  return {url, fileName};
});
