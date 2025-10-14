import { graphQLClient } from './graphql/gqlClient';
import { queries } from "./graphql/queries/provider";
import { mutations } from "./graphql/mutations/provider";
import { validateResponse } from "./utils";


/**
 * CRUD for documents
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
            const res = await graphQLClient.query(queries.getDocuments);
            const body = await validateResponse(res);
            return body.data.documents;
        } catch (err) {
            console.error('Get all docs:', err);   // DEV
            alert('Sorry, could not retrieve documents');
        }
    },


    /**
     * Get one document by id
     * 
     * @async
     * @param {string} id           id of document to fetch
     * @throws                      Error on fetch- or graphQL errors
     * @returns {Promise<Object>}   Document
     */
    getOne: async (id) => {
        try {
            const res = await graphQLClient.query(queries.getDocument, { id: id });
            const body = await validateResponse(res);
            return body.data.document;
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
            content: { ops: [{ inserted: "\n" }] },
            comments: [],
            code: false,
        };

        try {
            const res = await graphQLClient.query(mutations.createDocument, variables);
            const body = await validateResponse(res);
            return body.data.createDocument;
        } catch (err) {
            console.error('Create doc:', err);    // DEV
            alert("Sorry, could not create document");
        }
    },


    /**
     * Update document
     * 
     * @async
     * @param {Object} fields       Document fields { id, title, content, code, comments }
     * @throws                      Error if the create-operation fails
    * @returns {Promise<Boolean>}   true if successful
     */
    update: async (fields) => {
        const variables = { ...fields } ;

        try {
            const res = await graphQLClient.query(mutations.updateDocument, variables);
            const body = await validateResponse(res);
            return body.data.updateDocument;
        } catch (err) {
            console.error('Update doc:', err);    // DEV
            alert("Sorry, could not update document");
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
           const body = await validateResponse(res);
           return body.data.deleteDocument;
        } catch (err) {
            console.error('Delete doc:', err);        // DEV
            alert("Sorry, could not delete document");
        }
    },

};

export default documents;
