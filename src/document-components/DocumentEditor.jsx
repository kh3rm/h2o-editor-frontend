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
        switchToCreateMode,
        switchToViewMode,
    } = useDocumentContext();

    return (
        <div>
            {/* Conditional rendering of the correct top button based on mode:*/}

            <div className="top-button">
                {mode === 'view' && (
                    <button onClick={switchToCreateMode} className="create-button">
                        + New Document
                    </button>
                )}
                {(mode === 'create' || mode === 'update') && (
                    <button onClick={switchToViewMode} className="back-button" type="button">
                        ← Back
                    </button>
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
