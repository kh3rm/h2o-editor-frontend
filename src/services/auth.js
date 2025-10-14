/**
 * Authentication handler
 */
const auth = {
    // token: null, // PROD
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMThlNjBkYTUxYjRhMzc5NjdjYTA3YWNkIn0sImlhdCI6MTc2MDQzMTg4NCwiZXhwIjoxNzYwNTE4Mjg0fQ.OHcyJcQvSWIbDFHe_bQlbS2b2Mu-q9TOAZwB_IJ1LmY",

    getToken() {
        return this.token;
    }
};

export default auth;
