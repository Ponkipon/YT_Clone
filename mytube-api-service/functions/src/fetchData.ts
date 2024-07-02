import {Firestore} from "firebase-admin/firestore";
import {onCall} from "firebase-functions/v2/https";


const firestore = new Firestore;
const videoCollectionID = "videos";

export interface Video {
    id?: string,
    uid?: string,
    userid?: string,
    filename?: string,
    status?: "processing" | "processed",
    title?: string,
    description?: string,
    thumbnailPath?: string
}


export const getVideos = onCall({maxInstances: 1}, async () => {
  const snapshot = await firestore
    .collection(videoCollectionID)
    .limit(10)
    .get();
  return snapshot.docs.map((doc) => doc.data());
});
