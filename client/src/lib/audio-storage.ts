/**
 * Audio Storage Configuration
 * 
 * Uses Cloudflare R2 for all audio files
 * Requires VITE_R2_PUBLIC_URL environment variable to be set
 */

// Get R2 base URL from environment
const getAudioBaseUrl = (): string => {
  const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
  if (!r2Url) {
    console.error('[Audio Storage] ERROR: VITE_R2_PUBLIC_URL is not set. Audio files will not load.');
    throw new Error('R2 storage URL is not configured');
  }
  console.log('[Audio Storage] Using R2:', r2Url);
  return r2Url;
};

/**
 * Get the full URL for an audio file from R2
 * @param filename - The audio filename (e.g., 'Studying for Service Cp1 .mp3')
 * @returns Full URL to the audio file in R2
 */
export const getAudioUrl = (filename: string): string => {
  const baseUrl = getAudioBaseUrl();
  
  // If filename already includes full path, use it
  if (filename.startsWith('http')) {
    console.log('[Audio Storage] Using provided full URL:', filename);
    return filename;
  }
  
  // Handle Fire Starter files - strip firestarter/ prefix for R2
  // In R2, files are at root level (fire-starter-cpX.mp3)
  let r2Filename = filename;
  if (filename.startsWith('firestarter/')) {
    r2Filename = filename.replace('firestarter/', '');
  }
  
  // R2 URL - encode filename (handles spaces, emoji, special characters, etc.)
  // Split by '/' to handle subfolders, encode each part separately
  const pathParts = r2Filename.split('/').map(part => encodeURIComponent(part));
  const encodedFilename = pathParts.join('/');
  const fullUrl = `${baseUrl}/${encodedFilename}`;
  console.log('[Audio Storage] Generated R2 URL:', fullUrl);
  return fullUrl;
};

/**
 * Check if R2 storage is configured
 */
export const isUsingCloudStorage = (): boolean => {
  return !!import.meta.env.VITE_R2_PUBLIC_URL;
};

