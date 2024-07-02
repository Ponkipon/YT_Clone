'use client';

import React from "react";
import { uploadVideo } from "../utilities/Firebase/functions"
import styles from "./page.module.css"
export default function UploadPage() {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.item(0);
        if (file) {
            handleUpload(file);
        }
    }

    const handleUpload = async (file: File) => {
        try {
            const response = await uploadVideo(file);
            alert(`File uploaded succesfully. Response: ${JSON.stringify(response)}`);
        } catch (error) {
            alert(`Failed to Upload. Error Code: ${error}`);
        }
        
    }

    return (
        <div className={styles.buttonBox}>
            <input className={styles.uploadInput} id="upload" type="file" accept="video/*" 
            onChange={handleFileChange} />
            <label htmlFor="upload" className={styles.upload}>
                <svg viewBox="0 0 640 512" fill="white" height="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                </svg>
                <span>Upload Video</span>
            </label>
        </div>
    )
}