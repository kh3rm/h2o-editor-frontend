import { useDocumentContext } from './DocumentContext';

/**
 * @component DocumentForm
 * Handles the loading of the document-form, for document creation/update.
 */
function DocumentForm() {
    const {
        title,
        setTitle,
        content,
        setContent,
        createDocument,
        updateDocument,
        updateIndex,
    } = useDocumentContext();

    return (
        <div className="document-form">
            <label htmlFor="title">Title</label>
            <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="content">Content</label>
            <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>

            <button onClick={updateIndex === null ? createDocument : updateDocument}>
                {updateIndex === null ? "Create New Document" : "Update Document"}
            </button>

            <br />
        </div>
    );
}

export default DocumentForm;
