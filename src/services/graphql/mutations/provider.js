/**
 * Export graphQL Mutations as strings from SDL modules
 */

// Imports `.gql`-files as strings with `vite-plugin-string` (see vite.config)
import updateUser from './updateUser.gql';
import deleteUser from './deleteUser.gql';
import createDocument from './createDocument.gql';
import deleteDocument from './deleteDocument.gql';

export const mutations = { 
    updateUser,
    deleteUser,
    createDocument,
    deleteDocument,
};
