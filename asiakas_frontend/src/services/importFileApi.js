import { secureApiFetch } from "./apiFetch.js";

export const filePreview = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await secureApiFetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/preview/`,
    { method: "POST", body: formData }
  );
};
