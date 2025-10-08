/**
 * Export graphQL Mutations as strings from SDL modules
 */

// Imports `.gql`-files as strings with `vite-plugin-string` (see vite.config)
import createDocument from './createDocument.gql';

export const mutations = { createDocument };
