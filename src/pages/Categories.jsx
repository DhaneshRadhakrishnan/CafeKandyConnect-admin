import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import useImageUpload from "../hooks/useImageUpload";

export default function Categories() {
  // --- 1. STATE MANAGEMENT ---
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const { uploadImage, uploading } = useImageUpload();

  // --- 2. LOAD CATEGORIES ---
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  // --- 3. ACTIONS ---
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!name.trim()) return alert("Please enter a category name");
    
    let imageUrl = "";
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, `categories/${Date.now()}_${imageFile.name}`);
    }

    // Phase 2 Plan: upload -> addDoc -> setDoc to write categoryId -> update local state
    const ref = await addDoc(collection(db, "categories"), { name, imageUrl });
    await setDoc(ref, { categoryId: ref.id, name, imageUrl }, { merge: true });
    
    setCategories(prev => [...prev, { id: ref.id, categoryId: ref.id, name, imageUrl }]);
    
    // Reset form
    setName("");
    setImageFile(null);
    setPreview("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? This might break product links!")) return;
    await deleteDoc(doc(db, "categories", id));
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="cat-container">
      <h2>Manage Categories</h2>

      {/* --- 4. INLINE ADD FORM --- */}
      <div className="inline-form" style={{ marginBottom: "2rem", border: "1px solid #ddd", padding: "1rem" }}>
        <input 
          placeholder="Category Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <input type="file" onChange={handleFile} />
        {preview && <img src={preview} width="60" alt="Preview" style={{ marginLeft: "10px" }} />}
        
        <button onClick={handleAdd} disabled={uploading}>
          {uploading ? "Uploading..." : "Add Category"}
        </button>
      </div>

      {/* --- 5. IMAGE CARD GRID (Responsive) --- */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
        gap: "20px" 
      }}>
        {categories.map(cat => (
          <div key={cat.id} className="cat-card" style={{ border: "1px solid #eee", padding: "10px", textAlign: "center" }}>
            <img 
              src={cat.imageUrl || "https://via.placeholder.com/100"} 
              alt={cat.name} 
              style={{ width: "100%", height: "100px", objectFit: "cover" }} 
            />
            <h4>{cat.name}</h4>
            <button 
              onClick={() => handleDelete(cat.id)}
              style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}