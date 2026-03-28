import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import Modal from "../components/Modal";
import useImageUpload from "../hooks/useImageUpload";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [catMap, setCatMap] = useState({});
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const EMPTY = { title: "", description: "", price: "", categoryId: "", image: "", status: true };
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const { uploadImage, uploading } = useImageUpload();

  useEffect(() => {
    (async () => {
      const [pSnap, cSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories"))
      ]);
      const map = {};
      cSnap.forEach(d => { map[d.id] = d.data().name; });
      setCatMap(map);
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    let imageUrl = form.image;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, `products/${Date.now()}_${imageFile.name}`);
    }
    const data = { ...form, price: parseFloat(form.price), image: imageUrl };
    if (editing) {
      data.productId = editing.id;
      await setDoc(doc(db, "products", editing.id), data);
      setProducts(prev => prev.map(p => p.id === editing.id ? { id: editing.id, ...data } : p));
    } else {
      const ref = await addDoc(collection(db, "products"), data);
      await setDoc(ref, { ...data, productId: ref.id }, { merge: true });
      setProducts(prev => [...prev, { id: ref.id, ...data, productId: ref.id }]);
    }
    closeModal();
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleStatus = async product => {
    const next = !product.status;
    await updateDoc(doc(db, "products", product.id), { status: next });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: next } : p));
  };

  const openEdit = p => {
    setEditing(p);
    setForm(p);
    setPreview(p.image);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY);
    setImageFile(null);
    setPreview("");
  };

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: '100%',
    background: 'var(--surface3)',
    border: '1px solid var(--surface3)',
    borderRadius: 8,
    padding: '8px 12px',
    color: 'var(--text)',
    fontSize: 13
  };

  const labelStyle = {
    fontSize: 11,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '.5px',
    marginBottom: 6,
    display: 'block'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Products</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            placeholder="Search products..."
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: 240 }}
          />
          <button className="btn-primary" onClick={() => setModalOpen(true)}>+ Add Product</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <img
                    src={p.image}
                    alt=""
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                  />
                </td>
                <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.title}</td>
                <td style={{ color: 'var(--muted)' }}>{catMap[p.categoryId] || "Unknown"}</td>
                <td>LKR {p.price}</td>
                <td>
                  <button
                    onClick={() => toggleStatus(p)}
                    style={{
                      background: p.status ? 'rgba(76,175,80,.15)' : 'rgba(229,115,115,.15)',
                      color: p.status ? '#81C784' : '#EF9A9A',
                      border: 'none',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {p.status ? "✅ Active" : "❌ Disabled"}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No products found.</div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit Product" : "Add Product"}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              placeholder="e.g. Hazelnut Latte"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select Category</option>
              {Object.entries(catMap).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Price (LKR)</label>
            <input
              type="number"
              placeholder="e.g. 850"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Short description..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Image</label>
            <input type="file" onChange={handleFile} style={{ color: 'var(--text)', fontSize: 13 }} />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{ marginTop: 10, width: 100, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--surface3)' }}
              />
            )}
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={uploading} style={{ marginTop: 4 }}>
            {uploading ? "Uploading..." : "Save Product"}
          </button>
        </div>
      </Modal>
    </div>
  );
}