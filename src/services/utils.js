import auth from "./auth";

/**
 * Detect and throw fetch- and graphQL errors
 * Status might still be 200 on some graphQL errors
 * 
 * Return parsed body if no errors are detected
 * 
 * @param {Response} res        Response object from fetch
 * @throws                      Error on both fetch- and graphQl errors
 * @returns {Promise<Object>}   Parsed body
 */
export async function validateResponse(res) {
    const body = await res.json();

    if (!res.ok || body.errors) {
        const errorMessage = body.errors?.[0]?.message || body.errors?.[0]?.detail || `HTTP ${res.status} ${res.statusText}`;

        // Force log out on missing, invalid or expired token
        if (errorMessage === "invalid token" || errorMessage === "jwt expired" || errorMessage === "jwt must be provided") {
            auth.logOut();
            alert("Sorry, your session expired. Please log in again.")
            window.location.reload();
            return;
        }

        throw new Error(errorMessage);
    }
    
    return body;
}
