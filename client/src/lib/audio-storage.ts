/**
 * Audio Storage Configuration
 * 
 * Supports both local files and Cloudflare R2
 * Production: Uses R2 when VITE_R2_PUBLIC_URL is set (recommended)
 * Development: Falls back to local files if R2 not configured
 */

// Get base URL from environment or use local
const getAudioBaseUrl = (): string => {
  // In production, check for R2 URL (always use R2 if configured)
  const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
  if (r2Url) {
    console.log('[Audio Storage] Using R2:', r2Url);
    return r2Url;
  }
  
  // Fallback to local uploads (development only - not recommended for production)
  console.warn('[Audio Storage] R2 not configured, using local files (development mode)');
  return '/uploads/textbook-audio';
};

/**
 * Get the full URL for an audio file
 * @param filename - The audio filename (e.g., 'acts-in-action-cp1.mp3')
 * @returns Full URL to the audio file
 */
export const getAudioUrl = (filename: string): string => {
  const baseUrl = getAudioBaseUrl();
  
  // Local URL - use the path as-is
  // If filename already includes path, use it; otherwise prepend baseUrl
  if (filename.startsWith('/')) {
    console.log('[Audio Storage] Using provided path:', filename);
    return filename;
  }
  
  // Handle Fire Starter files - strip firestarter/ prefix for R2
  // In R2, files are at root level (fire-starter-cpX.mp3)
  let r2Filename = filename;
  if (filename.startsWith('firestarter/')) {
    r2Filename = filename.replace('firestarter/', '');
  }
  
  // If using R2 (production), encode the filename for URL
  if (baseUrl.startsWith('http')) {
    // R2 URL - encode filename properly (handles spaces, emoji, special chars)
    // Split by '/' to handle subfolders, encode each part separately
    const pathParts = r2Filename.split('/').map(part => encodeURIComponent(part));
    const encodedFilename = pathParts.join('/');
    const fullUrl = `${baseUrl}/${encodedFilename}`;
    console.log('[Audio Storage] Generated R2 URL:', fullUrl);
    return fullUrl;
  }
  
  // Local URL (development fallback) - use filename as-is, no conversion
  // Note: Local files must match exact filenames (spaces, emojis, etc.)
  // For local files, encode spaces and special chars for URL
  const localFilename = filename.split('/').map(part => encodeURIComponent(part)).join('/');
  const fullUrl = `${baseUrl}/${localFilename}`;
  console.log('[Audio Storage] Generated local URL:', fullUrl);
  return fullUrl;
};

/**
 * Check if we're using cloud storage
 */
export const isUsingCloudStorage = (): boolean => {
  return !!import.meta.env.VITE_R2_PUBLIC_URL;
};

