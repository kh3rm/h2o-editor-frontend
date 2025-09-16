/**
 * @component SavedDocuments
 * Handles the loading of the saved documents, for updating or deleting.
 */
function SavedDocuments({ documents, loadDocument, deleteDocument }) {
    console.log("Documents saved:", documents);
    return (
        <div className="saved-documents">
            <h2 className="saved-documents-h2">Saved Documents</h2>
            <div className="document-buttons-container">

                {/* Temporary usage of index here for the key until actual backend implementation,
                a db-unique-id is preferable*/}

                {documents.map((doc, index) => (
                    <div key={index} className="document-button-container">
                        <button className="document-button" onClick={() => loadDocument(index)}>
                            {doc.title}
                            <span className="delete-button" onClick={(e) => { e.stopPropagation(); deleteDocument(index); }}>☒</span>
                        </button>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default SavedDocuments;