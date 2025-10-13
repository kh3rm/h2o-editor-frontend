import logo from "../img/logo1.svg";
import poolLadder from "../img/pool2.svg"

function Header() {
  return (
    <header>
      <div className="header-logo">
        <img src={logo} alt="Logo" style={{ width: 49, height: 49 }} />
        <h1 className="header-title">docpool</h1>
      </div>
    </header>
  );
}

export default Header;
