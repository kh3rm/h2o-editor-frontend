import auth from '../services/auth';

/**
 * @component SignupForm
 * Let a user sign up for a new account
 */
function SignupForm() {
    return (
        <form className="signup-form" onSubmit={auth.signUp}>
            <h3>Sign up</h3>

            <label htmlFor="name">Name (Your name should be between 3-30 characters long)</label>
            <input type="text" name="name" id="name" min="3" max="30" required/>

            <label htmlFor="email">Email (Your email should be a valid email address)</label>
            <input type="email" name="email" id="email" required/>

            <label htmlFor="password">Password (Your password should be 8–64 characters long and contain a mix of uppercase letters, lowercase letters, and numbers)</label>
            <input type="password" name="password" id="password" min="8" max="64" required/>

            <button type="submit" className="signup-form-button">Sign up</button>
        </form>
    );    
}

export default SignupForm;
