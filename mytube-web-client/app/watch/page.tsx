import { Suspense } from "react";
import VideoPlayer from "./videoPlayer";

export default function Watch() {

    return ( 
        <div>
            <Suspense>
                <VideoPlayer />
            </Suspense>
        </div>
    );
}