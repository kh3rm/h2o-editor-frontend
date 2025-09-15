{/* DocumentContent-component - for showcasing a document with alternative
    readonly-formatting, superfluous for the time being*/}

import React from 'react';

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