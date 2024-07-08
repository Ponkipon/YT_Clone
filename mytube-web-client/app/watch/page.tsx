import { Suspense } from "react";
import VideoPlayer from "./videoPlayer";
import styles from "./page.module.css"

export default function Watch() {

    return ( 
        <div>
            <Suspense>
                <VideoPlayer />
            </Suspense>
        </div>
    );
}