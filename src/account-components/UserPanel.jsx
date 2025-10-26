import { useDocumentContext } from '../document-components/DocumentContext';

/**
 * @component
 * User panel at the top right corner
 */
function UserPanel() {
    const { user, setMode } = useDocumentContext();

    if (!user) {
        return <div className="user-panel user-panel-placeholder"></div>;
      }

    return (
        <div className="user-panel" onClick={() => setMode("profile")}>

            {/* User icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36" height="36" viewBox="0 0 24 24"
                fill="currentColor" aria-hidden="true" focusable="false"
                className="user-icon"
            >
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm7 8a7 7 0 0 0-14 0h14z"/>
            </svg>

            <span className="name">{user.name}</span>

        </div>
    );
}

export default UserPanel;
