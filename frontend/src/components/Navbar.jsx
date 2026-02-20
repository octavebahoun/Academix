import { Link, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import {
  LayoutGrid,
  Users,
  Cpu,
  MessageSquare,
  LogOut,
  Shield,
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const role = authService.getRole();
  const user = authService.getCurrentUser();

  if (
    !user ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  )
    return null;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-xl font-black text-indigo-500 tracking-tighter uppercase"
        >
          AcademiX
        </Link>

        <div className="flex gap-2">
          {role === "super_admin" && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname.startsWith("/admin") ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Shield size={16} /> Admin
            </Link>
          )}

          <Link
            to="/ai-tools"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === "/ai-tools" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Cpu size={16} /> IA Tools
          </Link>

          <Link
            to="/chat"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === "/chat" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
          >
            <MessageSquare size={16} /> Communauté
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-white">
            {user.nom} {user.prenom}
          </p>
          <p className="text-[10px] text-indigo-400 uppercase tracking-widest">
            {role}
          </p>
        </div>
        <button
          onClick={() => authService.logout()}
          className="p-2 text-slate-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
