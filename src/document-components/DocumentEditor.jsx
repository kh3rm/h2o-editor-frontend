import React, { useState } from 'react';
import { useDocumentContext } from './DocumentContext';
import SavedDocuments from './SavedDocuments';
import DocumentForm from './DocumentForm';
import Chat from '../view-components/Chat';
import Comments from '../view-components/Comments';
import CodeEditor from './CodeEditor';

/**
 * @component DocumentEditor
 * The main component that brings the document functionality together.
 */
function DocumentEditor() {
    const {
        mode,
        switchToViewMode,
        createDocument,
        createCodeModule,
        chatDisplayed,
        setChatDisplayed,
        commentsDisplayed,
        setCommentsDisplayed
    } = useDocumentContext();


    const toggleChatVisibility = () => {
        setChatDisplayed(chatDisplayed => !chatDisplayed);
    };
    
    const toggleCommentsVisibility = () => {
        setCommentsDisplayed(commentsDisplayed => !commentsDisplayed);
    };

    return (
        <>
            <div className="main-content">

                {/* Conditional rendering of the correct top button based on mode: */}

                <div className="top-button-container">
                    {mode === 'view' && (
                        <>
                        <button onClick={createDocument} className="top-button back-button" type="button">
                            Create New Document
                        </button>

                        <button onClick={createCodeModule} className="top-button back-button code-button" type="button">
                            Create New Code Module
                        </button>
                        </>
                    )}
                    
                    {(mode === 'update' || mode === 'code-edit') && (
                        <button onClick={switchToViewMode} className="top-button back-button" type="button">
                            ← Back
                        </button>
                    )}
                    
                    <br />
                </div>

                {/* Conditional rendering of the correct Document Component based on mode: */}

                {mode === 'view' && <SavedDocuments />}

                {mode === 'update' && (
                    <>
                    <DocumentForm key="document-quill-editor-form" />
                    </>
                )}

                {mode === 'code-edit' && (
                    <>
                    <CodeEditor key="document-code-editor" />
                    </>
                )}
            </div>

            {/* Chat and Comments accompanies DocumentForm in update-mode, but outside of the main-content on respective flanks. */}
            
            {mode === 'update' && (
                <>
                <Chat chatVisible={chatDisplayed} toggle={toggleChatVisibility} />
                <Comments commentsVisible={commentsDisplayed} toggle={toggleCommentsVisibility} />
                </>
            )}
        </>
    );
}

export default DocumentEditor;
