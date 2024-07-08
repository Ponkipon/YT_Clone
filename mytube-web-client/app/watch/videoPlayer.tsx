'use client';
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css"
import { getVideo, Video } from "../utilities/Firebase/functions";


export default async function VideoPlayer() {
    const videoPrefix = 'https://storage.googleapis.com/mytclone-processed-videos/'
    const videoSrc = useSearchParams().get('v') || '';
    // Remove the 'processed-' prefix   
    const withoutPrefix = videoSrc.replace(/^processed-/, '');
    // Remove the file extension to get the videoID
    const videoID = withoutPrefix.replace(/\.[^/.]+$/, '');
    if (videoSrc == '') {
        return <div>NO VIDEO URL</div>
    };

    const dataFetch = await getVideo(videoID) as Video;
    console.log(dataFetch);

    return ( 
        <div className={styles.videoPlayerContainer}>
            <div className={styles.VideoPlayer}>
                {<video className={styles.video} controls src={videoPrefix + videoSrc} />}
            </div>
            <div className={styles.TitleAndDescContainer}>
                <span className={styles.title}>{dataFetch.title || 'No title'}</span>
                <span className={styles.desc}>{dataFetch.description || 'No Description'}</span>
            </div>
        </div>
    );
}