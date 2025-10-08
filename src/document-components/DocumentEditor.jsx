import React from 'react';
import { useDocumentContext } from './DocumentContext';
import SavedDocuments from './SavedDocuments';
import DocumentForm from './DocumentForm';

/**
 * @component DocumentEditor
 * The main component that brings the document functionality together.
 */
function DocumentEditor() {
    const {
        mode,
        switchToViewMode,
        createDocument
    } = useDocumentContext();

    return (
        <div>
            {/* Conditional rendering of the correct top button based on mode:*/}

            <div className="top-button-container">
                {mode === 'view' && (
                    <button onClick={createDocument} className="top-button create-button">+ New Document</button>
                )}
                {(mode === 'create' || mode === 'update') && (
                    <button onClick={switchToViewMode} className="top-button back-button" type="button">← Back</button>
                )}
                <br />
            </div>

            {/* Conditional rendering of the correct Document Component based on mode:*/}

            {mode === 'view' ? (
                <SavedDocuments />
            ) : (mode === 'create' || mode === 'update') && (
                <DocumentForm />
            )}
        </div>
    );
}

export default DocumentEditor;
