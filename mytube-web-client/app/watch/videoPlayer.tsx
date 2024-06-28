'use client';
import { useSearchParams } from "next/navigation";

export default function VideoPlayer() {
    const videoPrefix = 'https://storage.googleapis.com/mytclone-processed-videos/'
    const videoSrc = useSearchParams().get('v')

    return ( 
        <div>
            {<video controls src={videoPrefix + videoSrc} />}
        </div>
    );
}