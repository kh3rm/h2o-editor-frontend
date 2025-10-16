import auth from '../services/auth';

/**
 * @component LoginForm
 * Lets an existing user log in to the application
 */
function LoginForm() {
    return (
        <form className="login-form" onSubmit={auth.logIn}>
            <h3>Log in</h3>

            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" required/>

            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" required/>

            <button type="submit" className="login-form-button">Log in</button>
        </form>
    );    
}

export default LoginForm;
