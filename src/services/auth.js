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
    
    // /**
    //  * Sign up for a new account, and set token
    //  * 
    //  * @async
    //  * @param {string} name
    //  * @param {string} email
    //  * @param {string} password
    //  * @throws                      Error if the operation fails
    //  * @returns {Promise<void>}            
    //  */
    // signUp: async function signUp(name, email, password) {
    //     try {
    //         const res = await accountClient.post("signup", { name, email, password });
    //         const body = await validateResponse(res);
    //         this.token = body.data.token;
    //     } catch (err) {
    //         console.error('signUp:', err);   // DEV
    //         alert('Sorry, could not sign up');
    //     }
    // },
    
    /**
     * Retrieve name, email and password from signup form
     * Sign up for a new account, and set token
     * 
     * @async
     * @param {Event} submitEvent   Triggerd when submitting signin form
     * @throws                      Error if the operation fails
     * @returns {Promise<void>}            
     */
    signUp: async function signUp(event) {
        try {
            event.preventDefault();
            const formData = new FormData(event.target);
            const name = formData.get("name");
            const email = formData.get("email");
            const password = formData.get("password");

            const res = await accountClient.post("signup", { name, email, password });
            const body = await validateResponse(res);
            this.token = body.data.token;

            console.log("SIGN UP SUCCESS:", this.getToken());
        } catch (err) {
            console.error('signUp:', err);   // DEV
            alert('Sorry, could not sign up');
        }
    },
    
//     /**
//      * Log in to an existing account, and set token
//      * 
//      * @async
//      * @param {string} email
//      * @param {string} password
//      * @throws                      Error if the operation fails
//      * @returns {Promise<void>}
//      */
//     logIn: async function logIn(email, password) {
//         try {
//             const res = await accountClient.post("login", { email, password });
//             const body = await validateResponse(res);
//             this.token = body.data.token;
//         } catch (err) {
//             console.error('LogIn:', err);   // DEV
//             alert('Sorry, could not log in');
//         }
//     },
// };
    
    /**
     * Retrieve email and password from login form
     * Log in to an existing account, and set token
     * 
     * @async
     * @param {Event} submitEvent   Triggerd when submitting log in form
     * @throws                      Error if the operation fails
     * @returns {Promise<void>}
     */
    logIn: async function logIn(event) {
        try {
            event.preventDefault();
            const formData = new FormData(event.target);
            const email = formData.get("email");
            const password = formData.get("password");

            const res = await accountClient.post("login", { email, password });
            const body = await validateResponse(res);
            this.token = body.data.token;

            console.log("LOG IN SUCCESS:", this.getToken());
        } catch (err) {
            console.error('LogIn:', err);   // DEV
            alert('Sorry, could not log in');
        }
    },
};

// DEV
// await auth.logIn("user1@example.com", "P4ssword");
// await auth.signUp("User 4", "user4@example.com", "P4ssword");


export default auth;
