/**
 * Export graphQL Queries as strings from SDL modules
 */

// Imports `.gql`-files as strings with `vite-plugin-string` (see vite.config)
import getUser from './getUser.gql';
import getDocument from './getDocument.gql';
import getDocuments from './getDocuments.gql';

export const queries = { getUser, getDocument, getDocuments };
