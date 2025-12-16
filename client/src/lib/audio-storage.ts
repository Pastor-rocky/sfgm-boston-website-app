/**
 * Audio Storage Configuration
 * 
 * Supports both local files and Cloudflare R2
 * Set R2_PUBLIC_URL in environment to use R2, otherwise uses local files
 */

// Get base URL from environment or use local
const getAudioBaseUrl = (): string => {
  // In production, check for R2 URL
  const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
  if (r2Url) {
    console.log('[Audio Storage] Using R2:', r2Url);
    return r2Url;
  }
  
  // Default to local uploads
  console.log('[Audio Storage] Using local files: /uploads/textbook-audio');
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
  
  // If using R2, handle R2 paths (may include subfolder like "firestarter/")
  if (baseUrl.startsWith('http')) {
    // R2 URL - encode the full path for URL (handles spaces, emoji, subfolders, etc.)
    // For firestarter, keep the path: firestarter/fire-starter-cp1.mp3
    // For Acts, filename is already correct
    const encodedPath = filename.split('/').map(part => encodeURIComponent(part)).join('/');
    const fullUrl = `${baseUrl}/${encodedPath}`;
    console.log('[Audio Storage] Generated R2 URL:', fullUrl);
    return fullUrl;
  }
  
  // For local files, convert paths and emoji names to URL-safe names
  let localFilename = filename;
  
  // Handle Fire Starter files from R2 (firestarter/fire-starter-cpX.mp3) -> local (fire-starter-cpX.mp3)
  if (filename.startsWith('firestarter/')) {
    localFilename = filename.replace('firestarter/', '');
  }
  // Handle Acts in Action emoji names
  else if (filename.includes('Act in Action') && filename.includes('🎬')) {
    const match = filename.match(/Act in Action 🎬  Cp(\d+)\.mp3/i);
    if (match && match[1]) {
      localFilename = `acts-in-action-cp${match[1]}.mp3`;
    }
  }
  
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

