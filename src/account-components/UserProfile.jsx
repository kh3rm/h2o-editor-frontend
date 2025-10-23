import { useState } from 'react';
import { useDocumentContext } from '../document-components/DocumentContext';
import usersService from '../services/users';
import auth from '../services/auth';

function UserProfile() {
    const { 
        user,
        setUser,
        switchToViewMode,
        setIsLoggedIn,
    } = useDocumentContext();

    const [show, setShow] = useState(true);     // Show password as default

    // if (!user) switchToViewMode();    

    async function handleSubmit(event) {
        event.preventDefault();
        if (await usersService.update(user)) {
            switchToViewMode();
        };
    }

    function logOut() {
        auth.logOut();
        setIsLoggedIn(auth.isLoggedIn());
    }

    async function deleteUser() {
        if (confirm(`Are you sure you want to delete the account of user '${user.name}'?`)) {
            await usersService.delete();
            logOut();
        }
    }

    return (
        <>
            <form className="profile-form" onSubmit={handleSubmit}>
                <h3>User profile</h3>

                <label htmlFor="name">Name</label>
                <input type="text"
                    name="name"
                    id="name"
                    title="Name should be between 3-30 characters long"
                    minLength="3"
                    maxLength="30"
                    onChange={e => setUser((prevUser) => ({ ...prevUser, name: e.target.value }))}
                    value={user.name}
                    required
                />

                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    title="Email should be a valid email address"
                    id="email"
                    onChange={e => setUser((prevUser) => ({ ...prevUser, email: e.target.value }))}
                    value={user.email}
                    required
                />

                <label htmlFor="password">Change password</label>
                <div className="password-wrapper">
                    <input 
                        type={ show ? "text" : "password" }
                        name="password"
                        id="password"
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$"
                        title="Password should be 8–64 characters long and contain a mix of uppercase letters, lowercase letters, and numbers"
                        onChange={e => setUser((prevUser) => ({ ...prevUser, password: e.target.value }))}
                    />
                    
                    <span
                        className="toggle-visibility"
                        onClick={() => setShow(!show)}
                    >
                        {show ? "🔓" : "🔒"}
                    </span>
                </div>

                <button type="submit" className="profile-form-button">Save</button>
            </form>

            <button type="button" className="logout-button" onClick={logOut} >Log out</button>

            <button type="button" className="red-delete-button" onClick={deleteUser} >Delete account</button>
        </>
    );
}

export default UserProfile;