import "./Navbar.css";

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-logo">CLOUD IDE</div>
    <ul className="navbar-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">Files</a></li>
      <li><a href="#">Terminal</a></li>
    </ul>
  </nav>
);

export default Navbar;