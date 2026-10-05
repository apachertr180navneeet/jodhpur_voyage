import { fetchCustomUrls } from '../services/api';

let cachedCustomUrls = [];

export const loadCustomUrlMappings = async () => {
  try {
    const res = await fetchCustomUrls();
    cachedCustomUrls = res.data || [];
    return cachedCustomUrls;
  } catch (err) {
    console.error('Error loading custom URL mappings:', err);
    return [];
  }
};

/**
 * Returns the configured active customPath for a targetUrl (e.g., '/contact' -> '/contact-us')
 * If no custom path is configured, returns default targetPath.
 */
export const getCustomPath = (targetPath) => {
  if (!targetPath) return '';
  const [path, hash] = targetPath.split('#');
  const hashSuffix = hash ? `#${hash}` : '';

  if (!cachedCustomUrls || cachedCustomUrls.length === 0) return targetPath;

  const normalizedTarget = path.toLowerCase().trim();
  const match = cachedCustomUrls.find(
    (item) => item.active !== false && item.targetUrl && item.targetUrl.toLowerCase().trim() === normalizedTarget
  );

  const resolved = match ? match.customPath : path;
  return resolved + hashSuffix;
};
