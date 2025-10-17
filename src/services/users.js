import { graphQLClient } from './graphql/gqlClient';
import { queries } from "./graphql/queries/provider";
import { mutations } from "./graphql/mutations/provider";
import { validateResponse } from "./utils";


/**
 * CRUD for users
 */
const users = {

    /**
     * Get one user by included auth token (client.js)
     * 
     * @async
     * @throws                      Error on fetch- or graphQL errors
     * @returns {Promise<Object>}   User
     */
    getOneByAuth: async () => {
        try {
            const res = await graphQLClient.query(queries.getUser);
            const body = await validateResponse(res);
            return body.data.user;
        } catch (err) {
            console.error('Get user:', err);   // DEV
            alert('Sorry, could not retrieve user');
        }
    },
    


    /**
     * Update user
     * 
     * @async
     * @param {Object} userFields       User userFields { name, email, password?, _id, etc}
     * @throws                      Error if the create-operation fails
    * @returns {Promise<Boolean>}   true if successful
     */
    update: async (userFields) => {
        const variables = { 
            name: userFields.name,
            email: userFields.email,
            ... (userFields.password ? { password: userFields.password } : {})  // set password if included in userFields
        };

        try {
            const res = await graphQLClient.query(mutations.updateUser, variables);
            const body = await validateResponse(res);
            return body.data.updateUser;
        } catch (err) {
            console.error('Update user:', err);    // DEV
            alert("Sorry, could not update user");
        }
    },
    
    
//     /**
//      * Delete document by id
//      * 
//      * @async
//      * @param {string} deleteId     The document-id
//      * @throws                      Error if the delete-operation fails
//      * @returns {Promise<boolean>}  true if successful
//     */
//    delete: async (deleteId) => {
//        try {
//            const res = await graphQLClient.query(mutations.deleteDocument, { id: deleteId });
//            const body = await validateResponse(res);
//            return body.data.deleteDocument;
//         } catch (err) {
//             console.error('Delete doc:', err);        // DEV
//             alert("Sorry, could not delete document");
//         }
//     },

};

export default users;
