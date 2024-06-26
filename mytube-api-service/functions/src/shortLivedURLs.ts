import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

const storage = new Storage();
const rawVideoBucketName = "mytclone-raw-videos";


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
  const bucket = storage.bucket(rawVideoBucketName);
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  // Get a V4 signed URL for uploading a file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  return {url, fileName};
});
