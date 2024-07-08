import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

const generateUploadUrlFunction = httpsCallable(functions, 'generateUploadURL');
const getVideosFunction = httpsCallable(functions, 'getVideos');
const getVideoFunction = httpsCallable(functions, 'getVideo');

export async function uploadVideo(file: File, title: string, description: string) {
    const response: any = await generateUploadUrlFunction({
        fileExtension: file.name.split('.').pop(),
        title: title,
        description: description
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
    userid?: string,
    filename?: string,
    status?: 'processing' | 'processed',
    title?: string,
    description?: string, 
    thumbnailPath?: string
}

export async function getVideos() {
    const response = await getVideosFunction();
    return response.data as Video[];
};

export async function getVideo(videoID: string) {
    const response = await getVideoFunction({
        videoID: videoID,
    }); 
    return response.data as Video[];
};