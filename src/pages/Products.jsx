import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import Modal from "../components/Modal";
import useImageUpload from "../hooks/useImageUpload"; // Assuming your hook is here

export default function Products() {
  // --- 1. STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [catMap, setCatMap] = useState({});
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form State
  const EMPTY = { title: "", description: "", price: "", categoryId: "", image: "", status: true };
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const { uploadImage, uploading } = useImageUpload();

  // --- 2. DATA LOADING (O(1) Lookup Plan) ---
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

  // --- 3. ACTIONS (Save, Delete, Toggle) ---
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleStatus = async (product) => {
    const next = !product.status;
    await updateDoc(doc(db, "products", product.id), { status: next });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: next } : p));
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm(p);
    setPreview(p.image);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false); setEditing(null); setForm(EMPTY); setImageFile(null); setPreview("");
  };

  // Search Logic
  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-container">
      <div className="header-actions">
        <input 
          placeholder="Search products..." 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <button onClick={() => setModalOpen(true)}>+ Add Product</button>
      </div>

      {/* --- 4. THE TABLE --- */}
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
              <td><img src={p.image} width="50" alt="" /></td>
              <td>{p.title}</td>
              <td>{catMap[p.categoryId] || "Unknown"}</td>
              <td>${p.price}</td>
              <td>
                <button onClick={() => toggleStatus(p)}>
                  {p.status ? "✅ Active" : "❌ Disabled"}
                </button>
              </td>
              <td>
                <button onClick={() => openEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- 5. THE MODAL & FORM --- */}
      <Modal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        title={editing ? "Edit Product" : "Add Product"}
      >
        <div className="form-grid">
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          
          <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
            <option value="">Select Category</option>
            {Object.entries(catMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>

          <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          
          <input type="file" onChange={handleFile} />
          {preview && <img src={preview} width="100" alt="Preview" />}

          <button onClick={handleSave} disabled={uploading}>
            {uploading ? "Uploading..." : "Save Product"}
          </button>
        </div>
      </Modal>
    </div>
  );
}