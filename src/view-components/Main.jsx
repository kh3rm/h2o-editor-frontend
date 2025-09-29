import DocumentEditor from '../document-components/DocumentEditor'
import { DocumentProvider } from '../document-components/DocumentContext';
function Main() {
    return (
        <>
            <main>
                <DocumentProvider>
                    <DocumentEditor/>
                </DocumentProvider>
            </main>
        </>
    );
}

export default Main;
