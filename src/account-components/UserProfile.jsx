import { useState } from 'react';
import usersService from '../services/users';

function UserProfile() {
    // const { user, setUser } = useDocumentContext();

    const [user, setUser] = useState({ name: "User1", email: "user1@example.com" });
    const [show, setShow] = useState(true);     // Show password as default


    async function handleSubmit(event) {
        event.preventDefault();
        await usersService.update(user);

        // TODO: leaveUserProfile
    }

    return (
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
    );
}

export default UserProfile;