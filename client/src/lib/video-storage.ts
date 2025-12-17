/**
 * Video Storage Configuration
 * 
 * Supports both local files and Cloudflare R2
 * Production: Uses R2 when VITE_R2_PUBLIC_URL is set (recommended)
 * Development: Falls back to local files if R2 not configured
 */

// Get base URL from environment or use local
const getVideoBaseUrl = (): string => {
  // In production, check for R2 URL (always use R2 if configured)
  const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
  if (r2Url) {
    console.log('[Video Storage] Using R2:', r2Url);
    return r2Url;
  }
  
  // Production R2 base URL (fallback if env var not set)
  // This is the Cloudflare R2 public bucket URL
  if (import.meta.env.PROD) {
    const prodR2Url = 'https://pub-5d553209d3dd4635aa4ee7406e048bf4.r2.dev';
    console.log('[Video Storage] Using production R2 (hardcoded):', prodR2Url);
    return prodR2Url;
  }
  
  // Fallback to local assets (development only)
  console.warn('[Video Storage] R2 not configured, using local files (development mode)');
  return '/assets';
};

/**
 * Get the full URL for a video file
 * @param filename - The video filename (e.g., 'welcome-video.mp4')
 * @returns Full URL to the video file
 */
export const getVideoUrl = (filename: string): string => {
  const baseUrl = getVideoBaseUrl();
  
  // If filename already includes full URL, use it
  if (filename.startsWith('http')) {
    console.log('[Video Storage] Using provided full URL:', filename);
    return filename;
  }
  
  // Remove leading slash if present
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  
  // If using R2 (production), encode the filename for URL
  if (baseUrl.startsWith('http')) {
    // R2 URL - encode filename properly (handles spaces, special chars)
    // Split by '/' to handle subfolders, encode each part separately
    const pathParts = cleanFilename.split('/').map(part => encodeURIComponent(part));
    const encodedFilename = pathParts.join('/');
    const fullUrl = `${baseUrl}/${encodedFilename}`;
    console.log('[Video Storage] Generated R2 URL:', fullUrl);
    return fullUrl;
  }
  
  // Local URL - ensure it starts with / for public folder
  const localPath = cleanFilename.startsWith('/') ? cleanFilename : `/${cleanFilename}`;
  console.log('[Video Storage] Generated local URL:', localPath);
  return localPath;
};

/**
 * Check if we're using cloud storage
 */
export const isUsingCloudStorage = (): boolean => {
  return !!import.meta.env.VITE_R2_PUBLIC_URL;
};

