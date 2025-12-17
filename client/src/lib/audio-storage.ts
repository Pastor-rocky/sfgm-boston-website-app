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
  
  // For local files, convert paths and emoji names to URL-safe names
  let localFilename = filename;
  let r2Filename = filename;
  
  // Handle Fire Starter files - strip firestarter/ prefix for both R2 and local
  // In R2, files are at root level (fire-starter-cpX.mp3)
  // For local files, they're in /uploads/textbook-audio/ (fire-starter-cpX.mp3)
  if (filename.startsWith('firestarter/')) {
    const cleanFilename = filename.replace('firestarter/', '');
    r2Filename = cleanFilename; // R2 uses root level
    localFilename = cleanFilename; // Local also uses just filename
  }
  // Handle Acts in Action emoji names
  else if (filename.includes('Act in Action') && filename.includes('🎬')) {
    const match = filename.match(/Act in Action 🎬  Cp(\d+)\.mp3/i);
    if (match && match[1]) {
      localFilename = `acts-in-action-cp${match[1]}.mp3`;
      r2Filename = filename; // R2 uses emoji name
    }
  }
  
  // If using R2, encode the filename for URL
  if (baseUrl.startsWith('http')) {
    // R2 URL - encode filename (handles spaces, emoji, etc.)
    const encodedFilename = encodeURIComponent(r2Filename);
    const fullUrl = `${baseUrl}/${encodedFilename}`;
    console.log('[Audio Storage] Generated R2 URL:', fullUrl);
    return fullUrl;
  }
  
  // Local URL
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

