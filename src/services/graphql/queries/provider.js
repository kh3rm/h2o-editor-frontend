/**
 * Export graphQL Queries as strings from SDL modules
 */

// Imports `.gql`-files as strings with `vite-plugin-string` (see vite.config)
import GetDocument from './GetDocument.gql';
import GetDocuments from './GetDocuments.gql';

export const queries = { GetDocument, GetDocuments };
