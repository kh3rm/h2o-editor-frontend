import { accountClient } from './accountClient';
import { validateResponse } from "./utils";


/**
 * Authentication handler
 */
const auth = {

    /**
     * Check if user is logged in
     * 
     * @return {boolean} true if user is logged in
     */
    isLoggedIn: function isLoggedIn() {
        return this.getToken() !== null;
    },

    /**
     * Get existing JWT token from session storage
     * 
     * @returns {string|null} token if logged in
     */
    getToken: function getToken() {
        return sessionStorage.getItem("token");
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
            sessionStorage.setItem("token", body.data.token);
            console.log(this.getToken() !== null ? "SIGN UP SUCCESS" : "SIGN UP FAIL");
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
            sessionStorage.setItem("token", body.data.token);
            console.log(this.getToken() !== null ? "LOG IN SUCCESS" : "LOG IN FAIL");
        } catch (err) {
            console.error('LogIn:', err);   // DEV
            alert('Sorry, could not log in');
        }
    },

    /**
     * Log out user by removing token from session storage
     * 
     * @returns {void}
     */
    logOut: function logOut() {
        sessionStorage.removeItem("token");
    }
};

export default auth;
