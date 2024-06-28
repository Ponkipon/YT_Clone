import {getVideos} from "./fetchData";
import {initializeApp} from "firebase-admin/app";
import * as functions from "firebase-functions";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {generateUploadURL} from "./shortLivedURLs";

initializeApp();

const firestore = new Firestore();

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoUrl: user.photoURL,
  };

  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  return;
});

export {generateUploadURL, getVideos};
