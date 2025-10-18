import { useState } from 'react';

/**
 * @component
 * User panel at the top right corner
 */
function UserPanel() {
    // const { user } = useDocumentContext();

    const user = {name: "User 1"};

    function goToUserProfile() {
        // TODO
    }

    return (
        <div className="user-panel" onClick={goToUserProfile}>

            {/* User icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50" height="50" viewBox="0 0 24 24"
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
