import { useState } from 'react';
import { useDocumentContext } from '../document-components/DocumentContext';
import auth from '../services/auth';

/**
 * @component ResetPasswordForm
 * Let a user reset a password, by sending a new password by email
 */
function ResetPasswordForm() {
    const { setMode } = useDocumentContext();

    const [email, setEmail] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        alert("Not yet implemented");
        // TODO: Check if user (email) exists
        // TODO: Reset password, and send an email
        setMode("login");
    }


    return (
        <>
            <form className="reset-form" onSubmit={handleSubmit}>
                <h3>Reset password</h3>
            
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    title="Enter the email of your account"
                    id="email"
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <button type="submit" className="reset-form-button">Send a new password by email</button>
            </form>
        </>
    );    
}

export default ResetPasswordForm;
