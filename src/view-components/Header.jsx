import logo from "../img/logo1.svg";
import { useDocumentContext } from "../document-components/DocumentContext";

function Header() {
  const { mode } = useDocumentContext();

  const headerDynamicColor = {
    backgroundColor: mode === 'code-edit' ? '#e9baff' : '#f5f9fc',
  };
  return (
    <header style={headerDynamicColor}>
      <div className="header-logo">
        <img src={logo} alt="Logo" style={{ width: 49, height: 49 }} />
        <h1 className="header-title">docpool</h1>
      </div>
    </header>
  );
}

export default Header;
