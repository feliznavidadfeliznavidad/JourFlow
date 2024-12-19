import axios from "axios";

const CLOUDINARY_CLOUD_NAME = 'dlkarsq04'
const CLOUDINARY_UPLOAD_PRESET = 'JourFlowApp'

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
    throw error;
  }
};