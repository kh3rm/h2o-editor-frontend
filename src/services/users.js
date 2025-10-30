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
    getUserData: async () => {
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
            alert(err.message); // useful information for the user
            return false;
        }
    },
    
    
    /**
     * Delete user by token.user.id
     * 
     * @async
     * @throws                      Error if the delete-operation fails
     * @returns {Promise<boolean>}  true if successful
    */
   delete: async () => {
       try {
           const res = await graphQLClient.query(mutations.deleteUser);
           const body = await validateResponse(res);
           return body.data.deleteUser;
        } catch (err) {
            console.error('Delete user:', err);        // DEV
            alert("Sorry, could not delete user");
        }
    },

};

export default users;
