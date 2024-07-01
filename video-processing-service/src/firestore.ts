import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";
import { credential } from "firebase-admin";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

// Note: This requires setting an env variable in Cloud Run
/**
 * if (process.env.NODE_ENV !== 'production') {
 * firestore.settings({
*      host: "localhost:8080", // Default port for Firestore emulator
*      ssl: false
*    });
*  }
 */

const videoCollectionID = 'videos';

export interface Video {
    id?: string,
    uid?: string,
    filename?: string,
    status?: 'processing' | 'processed',
    title?: string,
    description?: string,
    thumbnailPath?: string
}

async function getVideo(videoID: string) {
    const snapshot = await firestore.collection(videoCollectionID).doc(videoID).get();
    return (snapshot.data() as Video) ?? {};
}

export function setVideo(videoID: string, video: Video) {
    return firestore
    .collection(videoCollectionID)
    .doc(videoID)
    .set(video, {merge: true});
}

export function removeVideo(videoID: string) {
    return firestore
    .collection(videoCollectionID)
    .doc(videoID)
    .delete();
}

export async function isVideoNew(videoID: string) {
    const video = await getVideo(videoID);
    return video?.status === undefined;
}