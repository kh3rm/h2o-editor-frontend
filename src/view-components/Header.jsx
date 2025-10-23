/**
 * @component Header
 * Header component with title, logo and dynamic mode-conditional background color.
 * 
 * Houses the user-panel.
 */

import logo from "../img/logo1.svg";
import UserPanel from "../account-components/UserPanel";
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
      <UserPanel/>
    </header>
  );
}

export default Header;
