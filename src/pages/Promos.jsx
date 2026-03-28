import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import useImageUpload from '../hooks/useImageUpload';

const Promos = () => {
  const [promos, setPromos] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { uploadImage } = useImageUpload();

  useEffect(() => {
    const fetchPromos = async () => {
      const q = query(collection(db, "promos"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      setPromos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchPromos();
  }, []);

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleAddPromo = async e => {
    e.preventDefault();
    if (!imageFile || isUploading) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(imageFile, `promos/${Date.now()}_${imageFile.name}`);
      const newOrder = parseInt(orderNum) || 99;
      const docRef = await addDoc(collection(db, "promos"), { imageUrl: url, order: newOrder });
      setPromos(prev => [...prev, { id: docRef.id, imageUrl: url, order: newOrder }].sort((a, b) => a.order - b.order));
      setImageFile(null);
      setPreview("");
      setOrderNum("");
    } catch (err) {
      alert("Failed to upload promo image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Remove this promo slide?")) return;
    try {
      await deleteDoc(doc(db, "promos", id));
      setPromos(prev => prev.filter(p => p.id !== id));
    } catch {
      alert("Error deleting promo.");
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Carousel Promos</h2>

      <form onSubmit={handleAddPromo}>
        <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Image</div>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ color: 'var(--text)', fontSize: 13 }} />
            {preview && (
              <img src={preview} alt="preview" style={{ marginTop: 12, width: 120, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--surface3)' }} />
            )}
          </div>
          <div style={{ width: 120 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Order</div>
            <input
              type="number"
              placeholder="1, 2, 3..."
              value={orderNum}
              onChange={e => setOrderNum(e.target.value)}
              style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--surface3)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13 }}
            />
          </div>
          <button type="submit" disabled={!imageFile || isUploading} className="btn-primary">
            {isUploading ? "Uploading..." : "Add Slide"}
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {promos.map(promo => (
          <div key={promo.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={promo.imageUrl} alt="promo" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: 'rgba(245,188,111,.2)', color: 'var(--gold)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                Order: {promo.order}
              </span>
              <button className="btn-danger btn-sm" onClick={() => handleDelete(promo.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promos;