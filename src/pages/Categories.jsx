import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import useImageUpload from "../hooks/useImageUpload";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const { uploadImage, uploading } = useImageUpload();

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

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
    const ref = await addDoc(collection(db, "categories"), { name, imageUrl });
    await setDoc(ref, { categoryId: ref.id, name, imageUrl }, { merge: true });
    setCategories(prev => [...prev, { id: ref.id, categoryId: ref.id, name, imageUrl }]);
    setName("");
    setImageFile(null);
    setPreview("");
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this category? This might break product links!")) return;
    await deleteDoc(doc(db, "categories", id));
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Manage Categories</h2>

      <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Name</div>
          <input
            placeholder="e.g. Hot Coffee"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--surface3)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Image</div>
          <input type="file" onChange={handleFile} style={{ color: 'var(--text)', fontSize: 13 }} />
          {preview && (
            <img src={preview} alt="preview" style={{ marginTop: 10, width: 80, height: 50, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--surface3)' }} />
          )}
        </div>
        <button className="btn-primary" onClick={handleAdd} disabled={uploading}>
          {uploading ? "Uploading..." : "Add Category"}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {categories.map(cat => (
          <div key={cat.id} className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
            <img
              src={cat.imageUrl || `https://ui-avatars.com/api/?name=${cat.name}&background=8F4C34&color=fff`}
              alt={cat.name}
              style={{ width: '100%', height: 100, objectFit: 'cover' }}
            />
            <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{cat.name}</span>
              <button className="btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}