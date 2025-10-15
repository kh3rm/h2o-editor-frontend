import { accountClient } from './accountClient';
import { validateResponse } from "./utils";


/**
 * Authentication handler
 */
const auth = {

    /**
     * JSON Web Token of signed in user
     */
    token: null,

    /**
     * Get existing JWT token
     * 
     * @returns {string} token
     */
    getToken: function getToken() {
        return this.token;
    },
    
    /**
     * Sign up for a new account, and set token
     * 
     * @async
     * @param {string} name
     * @param {string} email
     * @param {string} password
     * @throws                      Error if the operation fails
     * @returns {Promise<void>}            
     */
    signUp: async function signUp(name, email, password) {
        try {
            const res = await accountClient.post("signup", { name, email, password });
            const body = await validateResponse(res);
            this.token = body.data.token;
        } catch (err) {
            console.error('signUp:', err);   // DEV
            alert('Sorry, could not sign up');
        }
    },
    
    /**
     * Log in to an existing account, and set token
     * 
     * @async
     * @param {string} email
     * @param {string} password
     * @throws                      Error if the operation fails
     * @returns {Promise<void>}
     */
    logIn: async function logIn(email, password) {
        try {
            const res = await accountClient.post("login", { email, password });
            const body = await validateResponse(res);
            this.token = body.data.token;
        } catch (err) {
            console.error('LogIn:', err);   // DEV
            alert('Sorry, could not log in');
        }
    },
};

// DEV
await auth.logIn("user1@example.com", "P4ssword");


export default auth;
