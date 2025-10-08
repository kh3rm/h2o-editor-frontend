/* istanbul ignore file */

/**
 * This DocumentContext-setup enables easy and consistent access to all the
 * relevant state-variables and functions for the Document Components,
 * cleaning up the code considerably, drastically reducing the need to feed them props.
 *
 * The main parent <DocumentEditor> is enclosed:
 *
 * <DocumentProvider>
 *    <DocumentEditor>
 * </DocumentProvider>
 *
 * ...thus in Main, enabling its use, and the exported custom hook useDocumentContext()
 * provides easy access to the document-context-object in the Document Component-modules,
 * where one can simply destructure it and pick out what one needs...
 *
*/

import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { graphQLClient } from '../graphql/client';
import { queries } from "../graphql/queries/provider";
import { mutations } from "../graphql/mutations/provider";

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [documents, setDocuments] = useState([]);
    const [updateId, setUpdateId] = useState(null);
    const [mode, setMode] = useState('view');

    // const H2O_EXPRESS_API_URI = 'https://h2o-editor-oljn22.azurewebsites.net/documents';
    const H2O_EXPRESS_API_URI = 'http://localhost:3000/documents';
    const H2O_GRAPHQL_API_URI = 'http://localhost:3000/graphql';

    // Fetches the documents once on initiation
    useEffect(() => {
        getAllDocuments();
    }, []);

    /**
     * Fetches all the documents from the backend and populates the documents state.
     * 
     * @async
     * @throws                    Error if the fetch-operation fails
     * @returns {Promise<void>}
     */
    const getAllDocuments = async () => {
        try {
            const res = await graphQLClient.query(queries.GetDocuments);

            if (!res.ok) throw new Error(`Status: ${res.status}`);
    
            const body = await res.json();
            console.log(body);  // graphQL json structure   // DEV
            if (body.errors) throw new Error(body.errors[0].message);   // still status 200 on graphQL error

            // TODO: Let setDocuments recieve the documents array directly
            const modifiedBody = { data: body.data.documents }    // to fit old json-api structure
            setDocuments(modifiedBody);
        } catch (err) {
            console.error('Get all docs error', err);   // DEV
            alert(err.message);                         // DEV

            // alert('Sorry, could not retrieve the documents.');  // PROD
        }
    };


    /**
     * Create a new default 'Untitled' document
     * 
     * @async
     * @throws                    Error if the create-operation fails
     * @returns {Promise<void>}
     */
    const createDocument = async () => {
        try {
            const variables = {
                title: "Untitled",
                content: "",
                code: false,
                comments: []
            };

            const res = await graphQLClient.query(mutations.createDocument, variables);

            if (!res.ok) throw new Error(`Status: ${res.status}`);

            const body = await res.json();
            if (body.errors) throw new Error(body.errors[0].message);   // still status 200 on graphQL error
            
            console.log("New document with id: ", body.data.createDocument);    // DEV

            switchToViewMode();
        } catch (err) {
            console.error('Create doc error:', err);    // DEV
            alert(err.message);                     // DEV
            // alert("Failed to create document");     // PROD
        }
    };

    /**
     * Update an existing document based on the state updateId, title and content
     * (i.e: the filled out forms and the chosen document's id (updateId))
     * 
     * @async
     * @throws                    Error if update-operation fails
     * @returns {Promise<void>}
     */
    const updateDocument = async () => {
        if (!updateId) return;

        if (!title.trim() || !content.trim()) {
            alert("Neither the Title nor Content fields can be empty.");
            return;
        }

        const updatedDocument = {
            id: updateId,
            title,
            content,
        };

        try {
            const res = await fetch(`${H2O_EXPRESS_API_URI}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDocument),
            });

            if (!res.ok) throw new Error(`Failed to update the document with the id ${updateId}`);

            switchToViewMode();

        } catch (err) {
            console.error('Update doc error:', err);
        }
    };

    /**
     * Delete a document based on its id after user confirmation.
     * 
     * Uses the documents state to showcase the document title for confirmation purposes 
     * before sending the delete request to the backend.
     * 
     * Might be handled more ideally in the future (implementing a web-socket-solution).
     * 
     * @async
     * @param {string} deleteId    The document-id
     * @throws                     Error if the delete-operation fails
     * @returns {Promise<void>}
     */
    const deleteDocument = async (deleteId) => {
        const documentToDelete = documents.data.find(doc => doc._id === deleteId);

        const isConfirmed = window.confirm(
            `Are you sure that you want to delete the document titled "${documentToDelete.title}"?`
        );

        if (isConfirmed) {
            try {
                const res = await fetch(`${H2O_EXPRESS_API_URI}/delete`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: deleteId }),
                });

                if (!res.ok) throw new Error('Failed to delete the requested document');

                console.log('Deleted document-id:', deleteId);
                switchToViewMode();
            } catch (err) {
                console.error('Delete error:', err);
            }
        }
    };

    /**
     * Load a document based on its id and populate the state title and content.
     * 
     * It makes sure to retrieve the latest version from the backend rather than relying on 
     * the local documents state.
     * 
     * Handling could be improved with eventual web-socket-implementation in the project.
     * 
     * @async
     * @param {string} id         Document ID
     * @throws                     Error if the retrieval fails
     * @returns {Promise<void>}
     */
    const loadDocument = async (id) => {
        try {
            const res = await graphQLClient.query(queries.GetDocument, { id: id });

            if (!res.ok) throw new Error(`Failed to fetch the document with the id: ${id}`);

            const json = await res.json();
            console.log(json);  // graphQL json structure
            const selectedDocument = json.data.document;

            setTitle(selectedDocument.title);
            setContent(selectedDocument.content);
            setUpdateId(selectedDocument._id);
            setMode('update');
        } catch (err) {
            console.error('Load Document Error:', err);
        }
    };

    /**
     * Resets the document-related state.
     * 
     * Clears title and content state, nullifies the updateId, and fetches and updates the
     * documents-state from backend, to keep the documents fresh and up to date.
     */
    const resetState = () => {
        setTitle('');
        setContent('');
        setUpdateId(null);
        getAllDocuments();
    };

    /**
     * Resets state and sets mode to 'create'.
     */
    const switchToCreateMode = () => {
        resetState();
        setMode('create');
    };

    /**
     * Resets state and sets mode to the default 'view'.
     */
    const switchToViewMode = () => {
        resetState();
        setMode('view');
    };

    // Log all the mode-changes (dev)
    useEffect(() => {
        console.log(mode);
    }, [mode]);

    return (
        <DocumentContext.Provider
            value={{
                title,
                setTitle,
                content,
                setContent,
                createDocument,
                updateDocument,
                updateId,
                deleteDocument,
                loadDocument,
                documents,
                mode,
                switchToCreateMode,
                switchToViewMode,
            }}>
            {children}
        </DocumentContext.Provider>
    );
};

/**
* Created custom React-hook for accessing the DocumentContext.
* 
* Provides convenient access to the full document-related context state
* and all the functions.
* 
* @returns {object}  Document context value
*/
export const useDocumentContext = () => {
  return useContext(DocumentContext);
};