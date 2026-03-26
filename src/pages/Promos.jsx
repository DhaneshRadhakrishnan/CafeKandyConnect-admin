import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import useImageUpload from '../hooks/useImageUpload'; // Assuming your custom hook path

const Promos = () => {
  const [promos, setPromos] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const { uploadImage } = useImageUpload();

  // Load existing promos sorted by order field
  useEffect(() => {
    const fetchPromos = async () => {
      const q = query(collection(db, "promos"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      setPromos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchPromos();
  }, []);

  // Handle image selection and preview cleanup
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!imageFile || isUploading) return;

    setIsUploading(true);
    try {
      const fileName = `promos/${Date.now()}_${imageFile.name}`;
      const url = await uploadImage(imageFile, fileName);
      
      const newOrder = parseInt(orderNum) || 99;
      const docRef = await addDoc(collection(db, "promos"), {
        imageUrl: url,
        order: newOrder
      });

      // Update local state and re-sort
      setPromos(prev => [...prev, { id: docRef.id, imageUrl: url, order: newOrder }]
        .sort((a, b) => a.order - b.order));

      // Reset form
      setImageFile(null);
      setPreview("");
      setOrderNum("");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload promo image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this promo slide? It will disappear from the app immediately.")) return;
    try {
      await deleteDoc(doc(db, "promos", id));
      setPromos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Error deleting promo.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Carousel Promos</h1>

      {/* Upload Section */}
      <form onSubmit={handleAddPromo} className="bg-white p-6 rounded-lg shadow-sm border mb-8 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Add New Slide</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {preview && (
              <div className="mt-3 relative inline-block">
                <img src={preview} alt="preview" className="w-48 h-28 object-cover rounded-lg border shadow-sm" />
                <p className="text-[10px] text-gray-400 mt-1 italic text-center">Preview only</p>
              </div>
            )}
          </div>
          
          <div className="w-32">
            <input 
              type="number" 
              placeholder="Order (1, 2...)" 
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <button 
            type="submit"
            disabled={!imageFile || isUploading}
            className={`px-6 py-2 rounded font-medium text-white transition ${isUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isUploading ? "Uploading..." : "Add Slide"}
          </button>
        </div>
      </form>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <div key={promo.id} className="bg-white border rounded-xl overflow-hidden shadow-sm group relative">
            <img src={promo.imageUrl} alt="promo" className="w-full h-40 object-cover" />
            <div className="p-3 flex justify-between items-center bg-gray-50">
              <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded">
                Order: {promo.order}
              </span>
              <button 
                onClick={() => handleDelete(promo.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promos;