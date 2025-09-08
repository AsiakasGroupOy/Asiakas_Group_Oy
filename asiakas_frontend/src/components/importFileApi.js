export const filePreview = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/preview/`,
    {method: "POST", body: formData}
  );
  if (!response.ok) throw new Error("Failed to preview file");
  return await response.json();
};