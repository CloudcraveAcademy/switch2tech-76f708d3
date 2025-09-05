import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, AlertTriangle } from 'lucide-react';

export type VideoSourceType = 'youtube' | 'google_drive' | 'google_meet' | 'zoom' | 'teams';

interface VideoPlayerProps {
  videoUrl: string;
  videoSourceType: VideoSourceType;
  title?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  videoSourceType, 
  title = 'Course Video',
  className = ''
}) => {
  if (!videoUrl) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
            📹
          </div>
          <p>No video available</p>
        </div>
      </div>
    );
  }

  const getEmbedUrl = (url: string, sourceType: VideoSourceType): string | null => {
    try {
      switch (sourceType) {
        case 'youtube':
          return getYouTubeEmbedUrl(url);
        case 'google_drive':
          return getGoogleDriveEmbedUrl(url);
        case 'google_meet':
          return getGoogleMeetEmbedUrl(url);
        case 'zoom':
          return getZoomEmbedUrl(url);
        case 'teams':
          return getTeamsEmbedUrl(url);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error processing video URL:', error);
      return null;
    }
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
      }
    }
    return null;
  };

  const getGoogleDriveEmbedUrl = (url: string): string | null => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return null;
  };

  const getGoogleMeetEmbedUrl = (url: string): string | null => {
    // Google Meet recordings are typically stored in Drive
    return getGoogleDriveEmbedUrl(url);
  };

  const getZoomEmbedUrl = (url: string): string | null => {
    // Zoom cloud recordings
    if (url.includes('zoom.us') && url.includes('/rec/')) {
      return url;
    }
    return null;
  };

  const getTeamsEmbedUrl = (url: string): string | null => {
    // Microsoft Teams/Stream recordings
    if (url.includes('microsoftstream.com') || url.includes('sharepoint.com')) {
      return url;
    }
    // Handle new Stream on SharePoint URLs
    if (url.includes('web.microsoftstream.com')) {
      return url.replace('web.microsoftstream.com', 'web.microsoftstream.com/embed');
    }
    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl, videoSourceType);

  if (!embedUrl) {
    return (
      <div className={`aspect-video ${className}`}>
        <Alert className="h-full flex flex-col items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
          <AlertDescription className="text-center">
            <div className="font-medium mb-2">Unable to display video</div>
            <div className="text-sm text-gray-600 mb-3">
              The video link appears to be invalid or unsupported for {videoSourceType}.
            </div>
            <div className="text-xs text-gray-500">
              <strong>Troubleshooting:</strong>
              <ul className="mt-1 text-left list-disc list-inside">
                <li>Check if the video link is publicly accessible</li>
                <li>Ensure sharing permissions are set correctly</li>
                <li>Try opening the link in a new tab to verify it works</li>
              </ul>
            </div>
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 text-sm"
            >
              Open original link <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

export default VideoPlayer;