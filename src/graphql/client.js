// const getToken = require("");    // TODO


// const H2O_GRAPHQL_API_URI = 'https://h2o-editor-oljn22.azurewebsites.net/graphql';
const H2O_GRAPHQL_API_URI = 'http://localhost:3000/graphql';

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
     * 
     */
    async query(query, variables = null) {
        const payload = variables ? { query, variables } : { query };
        // const token = getToken();    TODO

        return await fetch(H2O_GRAPHQL_API_URI, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                // Authorization: token ? `Bearer ${token}` : "" ,  // TODO
            },
            body: JSON.stringify(payload)
        });
    },
};
