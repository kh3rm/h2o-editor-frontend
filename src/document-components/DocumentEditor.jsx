import { useDocumentContext } from './DocumentContext';
import { useCodeContext } from '../code-components/CodeContext';

import LoginForm from '../account-components/LoginForm';
import SignupForm from '../account-components/SignupForm';
import ResetPasswordForm from '../account-components/ResetPasswordForm';
import UserProfile from '../account-components/UserProfile';
import SavedDocuments from './SavedDocuments';
import DocumentForm from './DocumentForm';
import CodeEditor from '../code-components/CodeEditor';

/**
 * @component DocumentEditor
 * The main component that brings the document functionality together.
 */
function DocumentEditor() {
    const {
        mode,
        setMode,
        switchToViewMode,
        createDocument,
        createCodeModule,
    } = useDocumentContext();
    
    const {
        switchToViewModeCode
    } = useCodeContext();


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
                    
                    {(mode === 'signup' || mode === 'reset-password' ) && (
                        <button onClick={() => setMode("login")} className="top-button back-button" type="button">
                            ← Back
                        </button>
                    )}

                    {(mode === 'update' || mode === 'profile' ) && (
                        <button onClick={switchToViewMode} className="top-button back-button" type="button">
                            ← Back
                        </button>
                    )}

                    {(mode === 'code-edit') && (
                        <button onClick={switchToViewModeCode} className="top-button back-button code-button" type="button">
                            ← Back
                        </button>
                    )}
                    
                    <br />
                </div>

                {/* Conditional rendering of the correct Account- / Document Component based on mode: */}

                {mode === 'login' && <LoginForm />}

                {mode === 'signup' && <SignupForm />}

                {mode === 'reset-password' && <ResetPasswordForm />}

                {mode === 'profile' && <UserProfile />}

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

            {/* Chat and Comments accompanies DocumentForm in update-mode, but outside of the main-content on respective flanks.
            ***Update: Moved to DocumentForm*** */}
        </>
    );
}

export default DocumentEditor;
