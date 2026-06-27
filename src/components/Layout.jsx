import { NavLink, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import s from "./Layout.module.css";

const links = [
  { to:"/",           label:"Dashboard",  end:true },
  { to:"/products",   label:"Products"         },
  { to:"/categories", label:"Categories"       },
  { to:"/orders",     label:"Orders"           },
  { to:"/users",      label:"Users"            },
  { to:"/promos",     label:"Promos"           },
];

export default function Layout() {
  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <div className={s.logo}>Café Kandy Admin</div>
        <nav>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `${s.link} ${isActive ? s.active : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className={s.logout} onClick={() => signOut(auth)}>Logout</button>
      </aside>
      <main className={s.main}><Outlet /></main>
    </div>
  );
}