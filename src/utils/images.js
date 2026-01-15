const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getLandImage = (land) => {
  if (land?.images?.length > 0 && land.images[0].url) {
    return land.images[0].url;
  }

return `${API_BASE}/images/placeholder.jpg`;
};
