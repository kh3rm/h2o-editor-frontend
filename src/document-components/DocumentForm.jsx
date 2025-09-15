{/* DocumentForm-component - handles the create/update-forms*/}

import React from 'react';

function DocumentForm({ title, setTitle, content, handleContentChange, createDocument, updateDocument, updateIndex }) {
    return (
        <div className="document-grid">

            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            />

            <label htmlFor="content">Content</label>
            <textarea id="content" value={content}
                onChange={(e) => handleContentChange(e.target.value)}
            ></textarea>

            <button onClick={updateIndex === null ? createDocument : updateDocument}>
                {updateIndex === null ? "Create New Document" : "Update Document"}
            </button>

            <br/>
        </div>
    );
}

export default DocumentForm;
