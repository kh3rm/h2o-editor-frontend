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

import { createContext, useContext, useState, useEffect } from 'react';
import documentsService from "../services/documents";
import usersService from "../services/users";

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [documents, setDocuments] = useState([]);
    const [updateId, setUpdateId] = useState(null);
    const [mode, setMode] = useState('view');


    // Fetches the documents once on initiation
    useEffect(() => {
        getAllDocuments();
        getUser()   // DEV
    }, []);


    /**
     * Get authenticated user and polulate user state
     */
    const getUser = async () => {
        const authenticatedUser = await usersService.getOneByAuth();
        console.log("USER:", authenticatedUser);
        setUser(authenticatedUser);
    }


    /**
     * Fetch documents via graphQL endpoint, and populate documents state
     * 
     * @async
     * @throws                  Fetch- or graphQL errors
     * @returns {Promise<void>}
     */
    const getAllDocuments = async () => {
        const docs = await documentsService.getAll();
        setDocuments(docs);
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
     * THIS IS ONLY A TEMPORARY IMPLEMENTATION TO BE REPLACED BY SOCKET-SOLUTION
     * 
     * Update an existing document based on the state updateId, title and content
     * (i.e: the filled out forms and the chosen document's id (updateId))
     * 
     * @async
     * @throws                    Fetch- or graphQL errors
     * @returns {Promise<void>}
     */
    const updateDocument = async () => {
        if (!updateId) return;
        
        if (!title.trim()) {
            alert("Title field can not be empty.");
            return;
        }
        
        const fields = {
            id: updateId,
            title,
            content,
            code: false,    // TODO: make dynamic
            comments: []    // TODO: make dynamic
        };
        
        await documentsService.update(fields);
        switchToViewMode();
    };
    
    
    /**
     * Delete a document by id via graphQL endpoint, after user confirmation,
     * and populate documents state
     * 
     * @param {string}  id          id of document to delete
     * @async
     * @throws                      Fetch- or graphQL errors
     * @returns {Promise<void>}
     */
    const deleteDocument = async (id, title) => {
        if (confirm(`Are you sure you want to delete '${title}'?`)) {
            await documentsService.delete(id);    // TODO: try to combine delete and getAll in one query?
            getAllDocuments();
        }
    };
    
    
    /**
     * THIS IS ONLY A TEMPORARY IMPLEMENTATION TO BE REPLACED BY SOCKET-SOLUTION
     * 
     * Get a document via graphQL endpoint and populate the states updateId, title and content.
     * 
     * @async
     * @param {string} id           Id of document to fetch
     * @throws                      Fetch- or graphQL errors
     * @returns {Promise<void>}
     */
    const loadDocument = async (id) => {
        const selectedDocument = await documentsService.getOne(id);

        setTitle(selectedDocument.title);
        setContent(selectedDocument.content);
        setUpdateId(selectedDocument._id);
        setMode('update');
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
