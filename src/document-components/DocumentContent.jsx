/**
 * @component DocumentContent
 * Showcase a specific document with alternative readonly-formatting, not used as of now.
 */
function DocumentContent({ title, content }) {
    return (
        <div className="document-container">
            <h1>{title}</h1>
            <textarea className="content-field-two"
                id="content-field"
                value={content}
                readOnly
            ></textarea>
        </div>
    );
}

export default DocumentContent;