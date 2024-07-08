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
    .limit(24)
    .get();
  return snapshot.docs.map((doc) => doc.data());
});


export const getVideo = onCall({maxInstances: 1}, async (request) => {
  const data = request.data;
  const docRef = firestore.collection(videoCollectionID).doc(data.videoID);
  const doc = await docRef.get();
  return doc.data();
});
