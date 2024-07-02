import Image from "next/image";
import Link from "next/link";
import { getVideos } from "./utilities/Firebase/functions";
import styles from "./page.module.css"


export default async function Home() {
  const videos = await getVideos();
  
  return (
    <main className={styles.main}>
      {
        videos.map((video) => (
          <div className={styles.videos} key={video.id} >
            <Link href={`/watch?v=${video.filename}`}>
              <Image src={`https://storage.googleapis.com/mytclone-thumbnails/${video.thumbnailPath}`} alt="video" width={320} height={180} className={styles.thumbnail} />
            </Link>
            <span className={styles.videoTitle}>{video.title}</span>
          </div>
        ))
      }
    </main>
  );
}

export const revalidate = 30;
