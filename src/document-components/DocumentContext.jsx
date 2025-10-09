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
import { graphQLClient } from '../services/graphql/client';
import { queries } from "../services/graphql/queries/provider";
import { mutations } from "../services/graphql/mutations/provider";
import documentsService from "../services/documents";
import usersService from "../services/users";

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [documents, setDocuments] = useState([]);
    const [updateId, setUpdateId] = useState(null);
    const [mode, setMode] = useState('view');

    // const H2O_EXPRESS_API_URI = 'https://h2o-editor-oljn22.azurewebsites.net/documents'; // PROD
    // const H2O_GRAPHQL_API_URI = 'https://h2o-editor-oljn22.azurewebsites.net/graphql'; // PROD
    const H2O_EXPRESS_API_URI = 'http://localhost:3000/documents';  // DEV
    const H2O_GRAPHQL_API_URI = 'http://localhost:3000/graphql';    // DEV

    // Fetches the documents once on initiation
    useEffect(() => {
        getAllDocuments();
    }, []);


    /**
     * Fetch documents via graphQL endpoint, and populate documents state
     * 
     * @async
     * @throws                  Fetch- or graphQL errors
     * @returns {Promise<void>}
     */
    const getAllDocuments = async () => {
        const docs = await documentsService.getAll();
        setDocuments({ data: docs });   // TODO just pass docs
    };

    
    /**
     * Create a new default 'Untitled' document via graphQl endpoint, and populate documents state
     * 
     * @async
     * @throws                    Fetch- or graphQL errors
     * @returns {Promise<void>}
     */
    const createDocument = async () => {
        await documentsService.create();    // TODO: try to combine create and getAll in one query?
        getAllDocuments();
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

        if (!title.trim()) {
            alert("Title field can not be empty.");
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
     * Delete a document by id via graphQL endpoint, after user confirmation,
     * and populate documents state
     * 
     * @param {string}  deleteId    id of document to delete
     * @async
     * @throws                      Fetch- or graphQL errors
     * @returns {Promise<void>}
     */
    const deleteDocument = async (deleteId) => {
        // TODO: user confirmation
        await documentsService.delete(deleteId);    // TODO: try to combine delete and getAll in one query?
        getAllDocuments();
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