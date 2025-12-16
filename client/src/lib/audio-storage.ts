/**
 * Audio Storage Configuration
 * 
 * Supports both local files and Cloudflare R2
 * Set R2_PUBLIC_URL in environment to use R2, otherwise uses local files
 */

// Get base URL from environment or use local
const getAudioBaseUrl = (): string => {
  // In production, check for R2 URL
  if (import.meta.env.VITE_R2_PUBLIC_URL) {
    return import.meta.env.VITE_R2_PUBLIC_URL;
  }
  
  // Default to local uploads
  return '/uploads/textbook-audio';
};

/**
 * Get the full URL for an audio file
 * @param filename - The audio filename (e.g., 'acts-in-action-cp1.mp3')
 * @returns Full URL to the audio file
 */
export const getAudioUrl = (filename: string): string => {
  const baseUrl = getAudioBaseUrl();
  
  // If using R2, ensure filename is just the filename (no path)
  if (baseUrl.startsWith('http')) {
    // R2 URL - encode filename for URL (handles spaces, emoji, etc.)
    const encodedFilename = encodeURIComponent(filename);
    return `${baseUrl}/${encodedFilename}`;
  }
  
  // Local URL - use the path as-is
  // If filename already includes path, use it; otherwise prepend baseUrl
  if (filename.startsWith('/')) {
    return filename;
  }
  
  // For local files, convert emoji names to URL-safe names
  // R2 uses emoji names, but local files use URL-safe names
  const localFilename = filename
    .replace(/Act in Action 🎬  Cp(\d+)\.mp3/i, 'acts-in-action-cp$1.mp3');
  
  return `${baseUrl}/${localFilename}`;
};

/**
 * Check if we're using cloud storage
 */
export const isUsingCloudStorage = (): boolean => {
  return !!import.meta.env.VITE_R2_PUBLIC_URL;
};

