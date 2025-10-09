import { graphQLClient } from './graphql/client';
import { queries } from "./graphql/queries/provider";
import { mutations } from "./graphql/mutations/provider";
import { validateGraphQLResponse } from "./utils";


/**
 * Create, Read and Delete for documents
 */
const documents = {

    /**
     * Get all documents
     * 
     * @async
     * @throws                      Error on fetch- or graphQL errors
     * @returns {Promise<Array>}    Array of documents
     */
    getAll: async () => {
        try {
            const res = await graphQLClient.query(queries.GetDocuments);
            const body = await validateGraphQLResponse(res);
            return body.data.documents;
        } catch (err) {
            console.error('Get all docs:', err);   // DEV
            alert('Sorry, could not retrieve documents');
        }
    },
    
    
    /**
     * Create a new default 'Untitled' document
     * 
     * @async
     * @throws                      Error if the create-operation fails
     * @returns {Promise<string>}   id of created document
     */
    create: async () => {
        // Fields for a default document
        const variables = {
            title: "Untitled",
            content: "",
            code: false,
            comments: []
        };

        try {
            const res = await graphQLClient.query(mutations.createDocument, variables);
            const body = await validateGraphQLResponse(res);
            return body.data.createDocument;
        } catch (err) {
            console.error('Create doc:', err);    // DEV
            alert("Sorry, could not create document");
        }
    },
    
    
    /**
     * Delete document by id
     * 
     * @async
     * @param {string} deleteId     The document-id
     * @throws                      Error if the delete-operation fails
     * @returns {Promise<boolean>}  true if successful
    */
   delete: async (deleteId) => {
       try {
           const res = await graphQLClient.query(mutations.deleteDocument, { id: deleteId });
           const body = await validateGraphQLResponse(res);
           return body.data.deleteDocument;
        } catch (err) {
            console.error('Delete doc:', err);        // DEV
            alert("Sorry, could not delete document");
        }
    },

};

export default documents;
