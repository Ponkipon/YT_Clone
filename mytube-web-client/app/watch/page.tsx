import { Suspense } from "react";
import VideoPlayer from "./videoPlayer";
export default function Watch() {

    return ( 
        <div>
            <h1>Watch Page</h1>
            <Suspense>
                <VideoPlayer />
            </Suspense>
        </div>
    );
}