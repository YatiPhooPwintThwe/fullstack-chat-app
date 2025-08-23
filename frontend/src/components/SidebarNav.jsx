import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const SidebarNav = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex w-40 bg-base-100 border-r border-base-300 p-4 flex-col justify-between text-base-content">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-14 px-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-base-content">Noti</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive ? "font-bold bg-gray-100" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <MessageSquare className="w-6 h-6" />
            <span>All Chats</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive ? "font-bold bg-gray-100" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <div className="relative">
              <img
                src={authUser?.profilePic || "/profile.png"}
                alt="Profile"
                className={`w-7 h-7 rounded-full object-cover border ${
                  location.pathname === "/profile" ? "ring-2 ring-black" : ""
                }`}
              />
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"
                title="Active now"
              />
            </div>
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                isActive ? "font-bold bg-gray-100" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Settings className="w-6 h-6" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 text-red-600 hover:text-red-800 mt-8 transition-all"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default SidebarNav;
