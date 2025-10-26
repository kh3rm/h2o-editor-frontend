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

  return (
    <header className={`header ${mode}`}>
      <div className="header-logo">
        <img src={logo} alt="Logo" style={{ width: 49, height: 49 }} />
        <h1 className="header-title">
          <span className="code-pre code-symbol" data-mode={mode}>{"<"}</span>
          <span className="title-text">docpool</span>
          <span className="code-post code-symbol" data-mode={mode}>{"⁄>"}</span>
        </h1>
      </div>
      <UserPanel />
    </header>
  );
}

export default Header;
