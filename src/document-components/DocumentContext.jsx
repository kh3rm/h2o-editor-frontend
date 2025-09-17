/**
 * This DocumentContext-setup enables easy and consistent access to all the
 * relevant state-variables and helper functions to the Document Components,
 * cleaning up the code considerably, drastically reducing the need to feed them props
 * (in fact, in this current implementation at least, feeding them none(!) ).
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

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [documents, setDocuments] = useState([]);
    const [updateIndex, setUpdateIndex] = useState(null);
    const [mode, setMode] = useState('view');

    const createDocument = () => {
        if (!title.trim() || !content.trim()) {
            alert("Neither the Title- or Content-fields are allowed to be empty.");
            return;
        }
        const newDocument = { title, content };
        setDocuments(prevDocuments => [...prevDocuments, newDocument]);
        resetState();
    };

    const updateDocument = () => {
        if (updateIndex !== null) {
            const updatedDocument = { title, content };
            setDocuments(prevDocuments =>
                prevDocuments.map((doc, index) =>
                    index === updateIndex ? updatedDocument : doc
                )
            );
            resetState();
        }
    };

    const deleteDocument = (index) => {
        const documentToDelete = documents[index];
        const isConfirmed = window.confirm(`Are you sure that you want to delete the document titled "${documentToDelete.title}"?`);
        if (isConfirmed) {
            setDocuments(prevDocuments => prevDocuments.filter((_, i) => i !== index));
            if (updateIndex === index) resetState();
        }
    };

    const loadDocument = (index) => {
        const selectedDocument = documents[index];
        setTitle(selectedDocument.title);
        setContent(selectedDocument.content);
        setUpdateIndex(index);
        setMode('update');
    };

    const resetState = () => {
        setTitle("");
        setContent("");
        setUpdateIndex(null);
        setMode('view');
    };

    const switchToCreateMode = () => {
        resetState();
        console.log(mode)
        setMode('create');
        console.log(mode)
    };

    const switchToViewMode = () => {
        resetState();
        setMode('view');
    };

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
                updateIndex,
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

export const useDocumentContext = () => {
    return useContext(DocumentContext);
};
