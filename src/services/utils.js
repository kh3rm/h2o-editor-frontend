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
export async function validateGraphQLResponse(res) {
    const body = await res.json();

    if (!res.ok || body.errors) {
        const errorMessage = body.errors?.[0]?.message ?? `HTTP ${res.status} ${res.statusText}`;
        throw new Error(errorMessage);
    }
    
    return body;
}
