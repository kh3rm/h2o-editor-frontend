import auth from "../auth";

/**
 * Custom fetch handler for interactions with a graphQL endpoint
 */
export const graphQLClient = {
    /**
     * Send Query or Mutation to a graphQL endpoint
     * 
     * @async
     * @param {string} query an SDL string (query or mutation)
     * @param {Object} variables for query/mutation arguments (optional)
     * @returns {Promise<Object>}   { data: { query-name: result } } || { errors: [] }
     */
    async query(query, variables = null) {
        const payload = variables ? { query, variables } : { query };
        const token = auth.getToken();

        return await fetch(import.meta.env.VITE_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: token ? `Bearer ${token}` : "" ,
            },
            body: JSON.stringify(payload)
        });
    },
};
