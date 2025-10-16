import Header from './view-components/Header'
import Main from './view-components/Main'
import Footer from './view-components/Footer'
import { DocumentProvider } from './document-components/DocumentContext';
import { CodeProvider } from './code-components/CodeContext';

function App() {
  return (
    <DocumentProvider>
    <CodeProvider>
      <Header />
      <Main />
      {/* <Footer discarded for the time being /> */}
      </CodeProvider>
    </DocumentProvider>
  );
}

export default App;
