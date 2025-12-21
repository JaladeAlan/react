const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getLandImage = (land) => {
  if (land?.images?.length > 0 && land.images[0].image_url) {
    return land.images[0].image_url;
  }

  return `${API_BASE}/storage/land_images/placeholder.jpg`;
};
