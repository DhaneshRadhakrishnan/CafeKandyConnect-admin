import { useEffect } from "react";
import s from "./Modal.module.css";

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  

  if (!isOpen) return null;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.box} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <h2>{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  );

}