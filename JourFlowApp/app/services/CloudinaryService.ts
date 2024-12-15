import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";
import axios, { AxiosError } from "axios";

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

interface CloudinaryFormData {
  uri: string;
  type: string;
  name: string;
}

export const uploadImageToCloudinary = async (
  imageUri: string
): Promise<string | null> => {
  console.warn("cloud name: ", CLOUDINARY_CLOUD_NAME);
  try {
    const formData = new FormData();
    const imageData: CloudinaryFormData = {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    };
    formData.append("file", imageData as unknown as Blob);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.secure_url;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "Cloudinary upload failed:",
      axiosError.response?.data || axiosError.message
    );
    return null;
  }
};