import { VideoSourceType } from '@/components/media/VideoPlayer';

export const VIDEO_SOURCE_OPTIONS = [
  { value: 'youtube', label: 'YouTube', description: 'YouTube video links' },
  { value: 'google_drive', label: 'Google Drive', description: 'Google Drive file links' },
  { value: 'google_meet', label: 'Google Meet Recording', description: 'Google Meet recording links' },
  { value: 'zoom', label: 'Zoom Cloud Recording', description: 'Zoom cloud recording links' },
  { value: 'teams', label: 'Microsoft Teams', description: 'Teams/Stream recording links' },
] as const;

export const validateVideoUrl = (url: string, sourceType: VideoSourceType): { isValid: boolean; message?: string } => {
  if (!url.trim()) {
    return { isValid: true }; // Empty URL is allowed
  }

  try {
    new URL(url); // Basic URL validation
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' };
  }

  switch (sourceType) {
    case 'youtube':
      return validateYouTubeUrl(url);
    case 'google_drive':
      return validateGoogleDriveUrl(url);
    case 'google_meet':
      return validateGoogleMeetUrl(url);
    case 'zoom':
      return validateZoomUrl(url);
    case 'teams':
      return validateTeamsUrl(url);
    default:
      return { isValid: true };
  }
};

const validateYouTubeUrl = (url: string): { isValid: boolean; message?: string } => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  const isValid = patterns.some(pattern => pattern.test(url));
  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)'
  };
};

const validateGoogleDriveUrl = (url: string): { isValid: boolean; message?: string } => {
  const isValid = url.includes('drive.google.com') && url.includes('/d/');
  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid Google Drive URL (e.g., https://drive.google.com/file/d/FILE_ID/view)'
  };
};

const validateGoogleMeetUrl = (url: string): { isValid: boolean; message?: string } => {
  // Google Meet recordings are typically stored in Drive
  const isDriveUrl = url.includes('drive.google.com') && url.includes('/d/');
  const isMeetUrl = url.includes('meet.google.com');
  
  const isValid = isDriveUrl || isMeetUrl;
  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid Google Meet recording URL or Google Drive link'
  };
};

const validateZoomUrl = (url: string): { isValid: boolean; message?: string } => {
  const isValid = url.includes('zoom.us') && (url.includes('/rec/') || url.includes('/recording/'));
  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid Zoom cloud recording URL (e.g., https://zoom.us/rec/share/...)'
  };
};

const validateTeamsUrl = (url: string): { isValid: boolean; message?: string } => {
  const isValid = url.includes('microsoftstream.com') || 
                 url.includes('sharepoint.com') || 
                 url.includes('web.microsoftstream.com') ||
                 url.includes('teams.microsoft.com');
  
  return {
    isValid,
    message: isValid ? undefined : 'Please enter a valid Microsoft Teams/Stream recording URL'
  };
};

export const getVideoSourceInstructions = (sourceType: VideoSourceType): string => {
  switch (sourceType) {
    case 'youtube':
      return 'Paste the YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)';
    case 'google_drive':
      return 'Paste the Google Drive file URL. Make sure the file is set to "Anyone with the link can view"';
    case 'google_meet':
      return 'Paste the Google Meet recording URL or the Google Drive link where the recording is stored';
    case 'zoom':
      return 'Paste the Zoom cloud recording URL. Make sure the recording is publicly accessible or shared';
    case 'teams':
      return 'Paste the Microsoft Teams/Stream recording URL. Ensure proper sharing permissions are set';
    default:
      return 'Paste the video URL';
  }
};