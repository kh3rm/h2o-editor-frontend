/**
 * Client for the json api
 */
export const accountClient = {
    /**
     * Send a POST request to the a specified endpoint of the json account api
     * 
     * @async
     * @param {string} path         Last part of url (signup or login)
     * @param {Object} payload      User data
     * @returns {Promise<Object>}   { data: token } || { errors: [] }
     */
    async post(path, payload) {
        return await fetch(import.meta.env.VITE_ACCOUNT_ENDPOINT + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload)
        });
    },
};
