// const H2O_ACCOUNT_API_URI = 'https://h2o-editor-oljn22.azurewebsites.net/account/';   // PROD
const H2O_ACCOUNT_API_URI = 'http://localhost:3000/account/';                            // DEV

/**
 * Client for the json api
 */
export const accountClient = {
    /**
     * Send a POST request to the a specified endpoint of the json api
     * 
     * @async
     * @param {string} endpoint     Last part of url (signup or login)
     * @param {Object} payload      User data
     * @returns {Promise<Object>}   { data: token } || { errors: [] }
     */
    async post(endpoint, payload) {
        return await fetch(H2O_ACCOUNT_API_URI + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload)
        });
    },
};
