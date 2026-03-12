import type { ImageUploadResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function uploadImages(files: File[]): Promise<ImageUploadResult[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData: { error?: string } = await response.json();
    throw new Error(errorData.error || "Error al subir imágenes");
  }

  const results: ImageUploadResult[] = await response.json();
  return results;
}
