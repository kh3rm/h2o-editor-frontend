import { useState } from 'react';
import { useDocumentContext } from '../document-components/DocumentContext';
import auth from '../services/auth';

/**
 * @component SignupForm
 * Let a user sign up for a new account
 */
function SignupForm() {
    const { setIsLoggedIn } = useDocumentContext();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(true);     // Show password as default

    async function handleSubmit(event) {
        event.preventDefault();
        await auth.signUp(name, email, password);
        setIsLoggedIn(auth.isLoggedIn());
    }

    return (
        <form className="signup-form" onSubmit={handleSubmit}>
            <h3>Sign up to h<sub>2</sub>o docpool</h3>

            <label htmlFor="name">Name</label>
            <input type="text"
                name="name"
                id="name"
                title="Name should be between 3-30 characters long"
                minLength="3"
                maxLength="30"
                onChange={e => setName(e.target.value)}
                required
            />

            <label htmlFor="email">Email</label>
            <input
                type="email"
                name="email"
                title="Email should be a valid email address"
                id="email"
                onChange={e => setEmail(e.target.value)}
                required
            />

            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
                <input 
                    type={ show ? "text" : "password" }
                    name="password"
                    id="password"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$"
                    title="Password should be 8–64 characters long and contain a mix of uppercase letters, lowercase letters, and numbers"
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                
                <span
                    className="toggle-visibility"
                    onClick={() => setShow(!show)}
                >
                    {show ? "🔓" : "🔒"}
                </span>
            </div>

            <button type="submit" className="signup-form-button">Sign up</button>
        </form>
    );    
}

export default SignupForm;
