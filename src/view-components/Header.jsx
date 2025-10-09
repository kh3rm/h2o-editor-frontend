import logo from "../img/logo1.svg";

function Header() {
  return (
    <header>
      <div className="header-logo">
        <img src={logo} alt="Logo" style={{ width: 49, height: 49 }} />
        <h1 className="header-title">Document Editor</h1>
      </div>
    </header>
  );
}

export default Header;
