'use client';
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css"

export default function VideoPlayer() {
    const videoPrefix = 'https://storage.googleapis.com/mytclone-processed-videos/'
    const videoSrc = useSearchParams().get('v')

    return ( 
        <div className={styles.VideoPlayer}>
            {<video className={styles.VideoPlayer} controls src={videoPrefix + videoSrc} />}
        </div>
    );
}