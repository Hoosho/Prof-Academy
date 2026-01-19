// /src/utils/youtube.util.js
import axios from 'axios';

const getYoutubeVideoId = ( url ) => {
  try{
        // Get Video Id From Link
    const urlObj = new URL( url );

    // If link: youtube.com/watch
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get( 'v' );
    }
    // If Link: youtu.be
    if( urlObj.hostname === 'youtu.be' ){
      return urlObj.pathname.slice( 1 );
    };

    // If Else Return Null
    return null;
  }catch(err){
    return null;
  };
};
export const getYoutubeVideoInfo = async ( videoUrl ) => {
  try{

    const videoId = getYoutubeVideoId( videoUrl );
    if( !videoId ) throw new Error( 'Invalid Youtube URL' );
    
    // Fetch Video Data From Youtube API
    // const apiKey = process.env.YOUTUBE_API_KEY;
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'snippet,contentDetails',
          id: videoId,
          key: 'AIzaSyCkUDIrlrDWsdAhVhO15UYjtSRmg5TWt7Y'
        }
      }
    );

    const video = response.data.items[0];
    if( !video ) throw new Error( 'Video Not Found' );

    // Convert Video Duration From ISO 8601 To Minutes
    const durationISO = video.contentDetails.duration;
    const durationMinutes = iso8601DurationToMinutes( durationISO );

    // Return Video Info
    return {
      videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high?.url || '',
      durationMinutes
    };
  }catch( err ){
    console.log( 'Youtube API Error: ', err.message );
    return null;
  };
};

// Convert Video Duration From ISO 8601 To Minutes
const iso8601DurationToMinutes = (isoDuration) => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  // نحول كل حاجة لدقائق كسور عشري
  return +(hours * 60 + minutes + seconds / 60).toFixed(2);
};