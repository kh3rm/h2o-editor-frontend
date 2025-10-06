// DocumentContext.js

/**
 * This DocumentContext-setup enables easy and consistent access to all the
 * relevant state-variables, socket-connections, and synced edit-functions
 * for the Document Components.
 *
 * This revised version replaces the traditional fetch-based CRUD-logic with a 
 * real-time socket-based approach, enabling smooth collaboration and (hopefully) complete
 * communication between the frontend and the backend, rendering much of the previously built
 * enabling structure obsolete.
 *
 * The main parent <DocumentEditor> is enclosed:
 *
 * <DocumentProvider>
 *    <DocumentEditor>
 * </DocumentProvider>
 *
 * ...thus in Main, enabling its use, and the exported custom hook useDocumentContext()
 * provides easy access to the document-context-object in the Document Component-modules,
 * where one can simply destructure it and pick out what one needs...
 */

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { throttle } from "lodash";

export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const socketRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [updateId, setUpdateId] = useState(null);
  const [mode, setMode] = useState('view');

  const currentDocIdRef = useRef(null); // A persistent reference to the current document-ID

  const emitTitleUpdate = useRef(null);  // Throttled title-emitter (to be fine-tuned and revised)
  const emitContentUpdate = useRef(null);  // Throttled content-emitter (to be fine-tuned and revised)

/*   const [titleEmitCount, setTitleEmitCount] = useState(0);  // Used in dev to fine tune throttle
  const [contentEmitCount, setContentEmitCount] = useState(0);  // Used in dev to fine tune throttle */

  // Keep currentDocIdRef in sync with currentDocId (ensures that the socket emits with latest value)
  useEffect(() => {
    currentDocIdRef.current = currentDocId;
  }, [currentDocId]);

  // Initialize the socket and set up the listeners
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    // Logs if connection is successful, and triggers the retrieval of all the documents
    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
      socket.emit("get-all-documents");
    });

    // Updates local documents-state with data received from the backend-emit
    socket.on("all-documents", (docs) => {
      setDocuments(docs);
      console.log(docs);

      // Reset local state if the currently selected document has been deleted by another user
    if (!docs.some((d) => d._id === currentDocIdRef.current)) {
    setCurrentDocId(null);
    setTitle("");
    setContent("");
    }
    });

    // After successful creation of a new document: join its socket-room, set the state
    socket.on("document-created", (doc) => {
      setCurrentDocId(doc._id);
      setTitle(doc.title || "");
      setContent(doc.content || "");
      socket.emit("join-document-room", doc._id);
    });

    // When a document is updated on the backend (e.g. by another user), update the local documents list, 
    // and if the updated document is currently open in the editor, also update the local title- and 
    // content-states to reflect the latest changes
    socket.on("document-updated", (doc) => {

      setDocuments((prev) =>
        prev.map((d) => (d._id === doc._id ? doc : d))
      );
      
      if (doc._id === currentDocIdRef.current) {
        setTitle(doc.title || "");
        setContent(doc.content || "");
      }
    });

    // Disconnect the socket properly to stop all socket-communication when closing
    return () => {
      socket.disconnect();
    };
  }, []);


  /**
   * Throttled title-socket-emitters These functions uses lodash.throttle()
   * to limit how frequently socket.emit is called during fast typing.
   *
   * Stored in a useRef-container and employs useEffect to persist across renders without resetting
   * the throttle timer (which would kind of defeat the point).
   */
  useEffect(() => {
    emitTitleUpdate.current = throttle((newTitle) => {
      if (currentDocIdRef.current) {
        socketRef.current.emit("edit-document", {
          id: currentDocIdRef.current,
          title: newTitle,
        });

        //setTitleEmitCount((prev) => prev + 1);
      }
    }, 175);

    emitContentUpdate.current = throttle((newContent) => {
      if (currentDocIdRef.current) {
        socketRef.current.emit("edit-document", {
          id: currentDocIdRef.current,
          content: newContent,
        });

        //setContentEmitCount((prev) => prev + 1);
      }
    }, 175);
  }, []);

  /**
   * Selects a document and updates the title and content state accordingly.
   *
   * Emits a socket request to backend to join the appropriate document-room for real-time collaboration.
   *
   * @param {object} doc   The document-object from the saved documents available to user
   */
  const selectDocument = (doc) => {
    setCurrentDocId(doc._id);
    setTitle(doc.title || "");
    setContent(doc.content || "");
    setUpdateId(doc._id);
    setMode('update');
    socketRef.current.emit("join-document-room", doc._id);
  };

  /**
   * Emits a socket request to create a new document.
   * 
   * The create-document-event will be caught and handled appropriately in the backend.
   */
  const createDocument = () => {
    socketRef.current.emit("create-document");
  };

  /**
   * Emits a socket request to backend to delete a specific document after user confirmation.
   * 
   * @param {string} docId   ID of the document to be deleted
   */
  const deleteDocument = (doc) => {
    if (window.confirm(`Are you sure that you want to delete the document with the title "${doc.title}"?`)) {
      socketRef.current.emit("delete-document", doc._id);
    }
  };

  /**
   * Called on title input-change.
   * 
   * Updates the local title-state and triggers a throttled socket emit.
   * 
   * @param {string} newTitle   Updated title value
   */
  const socketTitleChange = (newTitle) => {
    setTitle(newTitle);
    emitTitleUpdate.current(newTitle);
  };

  /**
   * Called on content input-change. 
   * 
   * Updates local content-state and triggers a throttled socket emit.
   * 
   * @param {string} newContent   Updated content value
   */
  const socketContentChange = (newContent) => {
    setContent(newContent);
    emitContentUpdate.current(newContent);
  };

  /**
   * Resets state and sets mode to the default 'view'.
   */
  const switchToViewMode = () => {
    resetState();
    setMode('view');
  };

  /**
   * Resets the document-related state.
   * 
   * Clears title and content state, nullifies the updateId.
   */
  const resetState = () => {
    setTitle('');
    setContent('');
    setUpdateId(null);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        setDocuments,
        currentDocId,
        setCurrentDocId,
        title,
        setTitle,
        content,
        setContent,
        mode,
        setMode,
        updateId,
        setUpdateId,     
        socketRef,
        currentDocIdRef,
        emitTitleUpdate,
        emitContentUpdate,
        selectDocument,
        createDocument,
        deleteDocument,
        socketTitleChange,
        socketContentChange,
        switchToViewMode,
        resetState,
/*      titleEmitCount,
        setTitleEmitCount,
        contentEmitCount,
        setContentEmitCount, */
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

/**
 * Created custom React-hook for accessing the DocumentContext.
 * 
 * Provides convenient access to the full document-related context state
 * and all the functions.
 * 
 * @returns {object}  Document context value
 */
export const useDocumentContext = () => {
  return useContext(DocumentContext);
};
