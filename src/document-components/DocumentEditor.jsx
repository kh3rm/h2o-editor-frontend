{/* Main DocumentEditor-component*/}

import { useState } from 'react';
import '../App.css';
import DocumentSaved from './DocumentSaved';
import DocumentForm from './DocumentForm';

{/* DocumentContent intended for showcasing the document content with alternative
formatting/styling, readonly, not used currently*/}

import DocumentContent from './DocumentContent';

function DocumentEditor() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [documents, setDocuments] = useState([]);
    const [updateIndex, setUpdateIndex] = useState(null);
    const [mode, setMode] = useState('view');

    const clear = () => {
        setTitle("");
        setContent("");
        setUpdateIndex(null);
        setMode('view');
    };

    const createDocument = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("Neither the Title- or Content-fields are allowed to be empty.");
            return;
        }
        const newDocument = { title, content };
        setDocuments(prevDocuments => [...prevDocuments, newDocument]);
        clear();
    };

    const loadDocument = (index) => {
        const selectedDocument = documents[index];
        setTitle(selectedDocument.title);
        setContent(selectedDocument.content);
        setUpdateIndex(index);
        setMode('update');
    };

    const updateDocument = (e) => {
        e.preventDefault();
        if (updateIndex !== null) {
            const updatedDocument = { title, content };
            setDocuments(prevDocuments =>
                prevDocuments.map((doc, index) =>
                    index === updateIndex ? updatedDocument : doc
                )
            );
            clear();
        }
    };

    const deleteDocument = (index) => {
        const documentToDelete = documents[index];
        const isConfirmed = window.confirm(`Are you sure that you want to delete the document titled "${documentToDelete.title}"?`);

        {/* This will look cleaner and more pleasant when we can stop using the index and instead
            work with a unique id-identifier against the db.*/}

        if (isConfirmed) {
            setDocuments(prevDocuments =>
                prevDocuments.filter((_, i) => i !== index)
            );
            if (updateIndex === index) clear();
        }
    };


    {/* Mode-related functions*/}


    const switchToCreateMode = () => {
        clear();
        setMode('create');
    };

    const switchToViewMode = () => {
        clear();
        setMode('view');
    };

    const handleBackClick = () => {
        switchToViewMode();
    };



    {/* Renders based on the current mode (view, create or update)*/}

    return (
        <div>
            <div className="toolbar">
                {mode === 'view' && (
                    <button onClick={switchToCreateMode} className="create-button">
                        + New Document
                    </button>
                )}
                {(mode === 'create' || mode === 'update') && (
                    <button onClick={handleBackClick} className="back-button"  type="button">
                        🢨 Back
                    </button>
                )}
                <br />
            </div>

            {mode === 'view' && (
                <DocumentSaved
                    documents={documents}
                    loadDocument={loadDocument}
                    deleteDocument={deleteDocument}
                />
            )}

            {(mode === 'create' || mode === 'update') && (
                <DocumentForm
                    title={title}
                    setTitle={setTitle}
                    content={content}
                    handleContentChange={setContent}
                    createDocument={createDocument}
                    updateDocument={updateDocument}
                    updateIndex={updateIndex}
                />
            )}
        </div>
    );
}

export default DocumentEditor;
