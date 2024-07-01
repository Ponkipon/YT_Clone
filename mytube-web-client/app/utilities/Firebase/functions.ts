import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

const generateUploadUrlFunction = httpsCallable(functions, 'generateUploadURL');
const getVideosFunction = httpsCallable(functions, 'getVideos');


export async function uploadVideo(file: File) {
    const response: any = await generateUploadUrlFunction({
        fileExtension: file.name.split('.').pop()
    });
        
    // Upload the file via the signed URL
    const uploadResult = await fetch(response?.data?.url, {
        method: 'PUT', 
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    return uploadResult;

}

export interface Video {
    id?: string,
    uid?: string,
    filename?: string,
    status?: 'processing' | 'processed',
    title?: string,
    description?: string, 
    thumbnailPath?: string
  }

export async function getVideos() {
    const response = await getVideosFunction();
    return response.data as Video[];
}
