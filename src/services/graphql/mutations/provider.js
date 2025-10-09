/**
 * Export graphQL Mutations as strings from SDL modules
 */

// Imports `.gql`-files as strings with `vite-plugin-string` (see vite.config)
import createDocument from './createDocument.gql';
import updateDocument from './updateDocument.gql';
import deleteDocument from './deleteDocument.gql';

export const mutations = { createDocument, updateDocument, deleteDocument };
