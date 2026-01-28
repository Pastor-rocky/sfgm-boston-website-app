/**
 * Image Storage Configuration
 * 
 * Supports both local files and Cloudflare R2
 * Production: Uses R2 when VITE_R2_PUBLIC_URL is set (recommended)
 * Development: Falls back to local files if R2 not configured
 */

// Get base URL from environment or use local
const getImageBaseUrl = (): string => {
  // In production, check for R2 URL (always use R2 if configured)
  const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
  if (r2Url) {
    console.log('[Image Storage] Using R2:', r2Url);
    return r2Url;
  }
  
  // Fallback to local public folder (development only)
  console.warn('[Image Storage] R2 not configured, using local files (development mode)');
  return '';
};

/**
 * Get the full URL for an image file
 * @param filename - The image filename (e.g., 'Watchmen Logo.jpeg' or '/pss.jpeg')
 * @returns Full URL to the image file
 */
export const getImageUrl = (filename: string): string => {
  const baseUrl = getImageBaseUrl();
  
  // If filename already includes full URL, use it
  if (filename.startsWith('http')) {
    console.log('[Image Storage] Using provided full URL:', filename);
    return filename;
  }
  
  // If using R2 (production), encode the filename for URL
  if (baseUrl && baseUrl.startsWith('http')) {
    // R2 URL - encode filename properly (handles spaces, special chars)
    // Remove leading slash if present
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    // Split by '/' to handle subfolders, encode each part separately
    const pathParts = cleanFilename.split('/').map(part => encodeURIComponent(part));
    const encodedFilename = pathParts.join('/');
    const fullUrl = `${baseUrl}/${encodedFilename}`;
    console.log('[Image Storage] Generated R2 URL:', fullUrl);
    return fullUrl;
  }
  
  // Local URL - ensure it starts with / for public folder
  // URL encode spaces and special characters for local paths too
  const localPath = filename.startsWith('/') ? filename : `/${filename}`;
  // Encode the filename part but keep the path structure
  const pathParts = localPath.split('/');
  const encodedParts = pathParts.map((part, index) => {
    if (index === 0) return part; // Keep leading slash
    return encodeURIComponent(part);
  });
  const encodedPath = encodedParts.join('/');
  console.log('[Image Storage] Generated local URL:', encodedPath);
  return encodedPath;
};

/**
 * Check if we're using cloud storage
 */
export const isUsingCloudStorage = (): boolean => {
  return !!import.meta.env.VITE_R2_PUBLIC_URL;
};





