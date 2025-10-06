import React from 'react';  
import { useDocumentContext } from './DocumentContext';

/**
 * @component SavedDocuments
 * Handles the loading of the saved documents, for updating/viewing or deleting.
 */
function SavedDocuments() {
    const {
        documents,
        selectDocument,
        deleteDocument
    } = useDocumentContext();

    return (
        <div className="saved-documents">
            <h2 className="saved-documents-h2">Saved Documents</h2>
            <div className="document-buttons-container">

                {Array.isArray(documents) && documents.map(doc => (
                    <div key={doc._id} className="document-button-container">
                        <button className="document-button" onClick={() => selectDocument(doc)}>
                            {doc.title}
                            <span className="delete-button" onClick={(e) => { e.stopPropagation(); deleteDocument(doc); }}>☒</span>
                        </button>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default SavedDocuments;