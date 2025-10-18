import { useState } from 'react';
import auth from '../services/auth';

/**
 * @component LoginForm
 * Let an existing user log in to the application
 */
function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);    // Hide password as default

    async function handleSubmit(event) {
        event.preventDefault();
        auth.logIn(email, password);
    }

    function goToResetPassword() {
        // TODO
    }

    function goToSignup() {
        // TODO
    }

    return (
        <>
            <form className="login-form" onSubmit={handleSubmit}>
                <h3>Log in to h<sub>2</sub>o docpool</h3>

                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    title="Enter the email of your account"
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
                        title="Enter the password of your acount"
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


                <button type="submit" className="login-form-button">Log in</button>
            </form>
        
            <p><span className="link" onClick={goToResetPassword}>Forgot your password?</span></p>

            <p><span className="link" onClick={goToSignup}>Sign up to h<sub>2</sub>o docpool</span></p>

        </>
    );    
}

export default LoginForm;
