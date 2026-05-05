import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkStyle =
    "px-4 py-2 rounded-xl text-sm transition hover:bg-code-bg";

  const activeStyle = "bg-accent text-white";

  return (
    <div className="w-full border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <h1 className="font-semibold text-text-h">
          MicroTrainer
        </h1>

        {/* Links */}
        <div className="flex gap-2">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/interview"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
          >
            Interview
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/trainer"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : ""}`
            }
          >
            Trainer
          </NavLink>

        </div>
      </div>
    </div>
  );
};

export default Navbar;