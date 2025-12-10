import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
    const location = useLocation();
    const isActive = (path: string) => {
        return location.pathname === path ? 'active-link' : '';
    }
    return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <span>SDK Demo</span>
        </div>
        
        <ul className="nav-links">
          <li className={isActive('/')}>
            <Link to="/">Web Viewer</Link>
          </li>
          <li className={isActive('/image-to-pdf')}>
            <Link to="/image-to-pdf">Image → PDF</Link>
          </li>
          <li className={isActive('/pdf-to-image')}>
            <Link to="/pdf-to-image">PDF → Image</Link>
          </li>
        </ul>
      </div>
    </nav>
    )
}
export default NavBar;