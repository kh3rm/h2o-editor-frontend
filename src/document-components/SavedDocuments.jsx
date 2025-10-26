/**
 * @component SavedDocuments
 * Handles the loading of the saved documents, for updating/viewing or deleting.
 */

import React from 'react';  
import { useDocumentContext } from './DocumentContext';
import { useCodeContext } from '../code-components/CodeContext';

import mailInvite from "../img/mail.svg";

function SavedDocuments() {
    const {
        documents,
        joinEditDocument,
        deleteDocument,
        shareDocument,
    } = useDocumentContext();

    const {
        openCodeEditor
    } = useCodeContext();

    return (
        <div className="saved-documents">
            <h2 className="saved-documents-h2">Saved Documents</h2>
            <div className="document-buttons-container">

                {Array.isArray(documents) && documents.map(doc => (
                    <div key={doc._id} className="document-button-container">
                        <button className={`
                            document-button
                            ${doc.code ? 'code-button' : ''}
                        `} onClick={() => doc.code ? openCodeEditor(doc._id) : joinEditDocument(doc._id)}>
                            {doc.title}
                            <span className="id-button id-square"> _id: ...{doc._id.slice(-5)}</span>
                            <span className="delete-button" onClick={(e) => { e.stopPropagation(); deleteDocument(doc); }}>☒</span>
                            <span className="share-button" onClick={(e) => { e.stopPropagation(); shareDocument(doc._id); }}>
                            <img
                                className="mail-svg"
                                src={mailInvite}
                                alt="mailInvite"
                                style={{ width: 17, height: 17 }}
                                />
                            </span>
                        </button>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default SavedDocuments;
