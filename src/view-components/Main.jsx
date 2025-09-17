import DocumentEditor from '../document-components/DocumentEditor'
import { DocumentProvider } from '../document-components/DocumentContext';
function Main() {
    return (
        <>
            <div className="main">
                <DocumentProvider>
                    <DocumentEditor />
                </DocumentProvider>
            </div>
        </>
    );
}

export default Main;
