import { getYoutubeVideoInfo } from "./youtube.util.js";
( async () => {
    const videoUrl = 'https://youtu.be/wSb7xxzWTwU?si=KmHIHpa9DtbsyBON'
    const info = await getYoutubeVideoInfo( videoUrl );
    console.log(info);
})()