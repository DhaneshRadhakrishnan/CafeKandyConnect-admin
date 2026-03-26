import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export default function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file, storagePath) => {
    setUploading(true);
    try {
      const storageRef = ref(storage, storagePath);
      const snap = await uploadBytes(storageRef, file);
      return await getDownloadURL(snap.ref);
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
}