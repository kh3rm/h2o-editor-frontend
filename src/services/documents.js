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
            console.error('Get one doc:', err);   // DEV
            alert('Sorry, could not retrieve document');
        }
    },
    
    
    /**
     * Create a new default 'Untitled' document
     * 
     * @async
     * @param {boolean} code        Code module if true
     * @throws                      Error if the create-operation fails
     * @returns {Promise<string>}   id of created document
     */
    create: async (code = false) => {
        // Fields for a default document / code module
        const variables = {
            title: "Untitled",
            content: code ? { code: ""} : { ops: [{ insert: "\n" }] },
            code,
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


    share: async (docId, email) => {
        try {
            const res = await graphQLClient.query(mutations.shareDocument, { docId, email });
            const body = await validateResponse(res);
            alert(`An invitation has been sent to ${email}.`);
        } catch (err) {
            console.error('Share doc:', err);        // DEV
            alert("Sorry, could not share document");
        }
    },

};

export default documents;
