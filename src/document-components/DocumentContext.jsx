// DocumentContext.js

/**
 * This DocumentContext-setup enables easy and consistent access to all the
 * relevant state-variables, socket-connections, and synced edit-functions
 * for the Document Components.
 *
 * This re-revised version replaces the original traditional fetch-based REST-API CRUD-logic
 * (that fleetingly made an appearance as an experimental fully socket-based implementation),
 * to a now more sound hybrid-approach, where the newly established GraphQL-structure provides a 
 * single endpoint that enables the Type-checked and smooth Creation (C), Reading/loading (R), and
 * Deletion (D) of documents in the DB.
 * 
 * Socket keeps responsibility of the one area where it really shines: Updating (U), and
 * room-handling, in a dynamic, real-time collaborative manner, in JoinEditDocument(), with complementing
 * socket-related logic on the backend.
 * 
 * The Quill-editor structured content is now dynamically updated with every keystroke/selection change
 * via deltas, working against a last updated version in cache on the backend, which is persisted and
 * sent to the db after either: 2 seconds of user inactivity, 15 seconds general autosave, 20 new deltas,
 * socket(user) room exit or disconnect.
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

import { graphQLClient } from '../graphql/client';
import { queries } from "../graphql/queries/provider";
import { mutations } from "../graphql/mutations/provider";

// const H2O_EXPRESS_API_URI = 'http://localhost:3000/documents';
// const H2O_GRAPHQL_API_URI = 'http://localhost:3000/graphql';

export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const socketRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [localTitle, setLocalTitle] = useState(title);
  const [clientId, setClientId] = useState(null);

  const [updateId, setUpdateId] = useState(null);
  const [mode, setMode] = useState("view");

  const currentDocIdRef = useRef(null);

  const emitTitleUpdate = useRef(null);
  const emitContentUpdate = useRef(null);

  // Chat/Comments-visibility

  const [chatDisplayed, setChatDisplayed] = useState(false);
  const [commentsDisplayed, setCommentsDisplayed] = useState(false);


  // Keeps the ref always in sync with the current document ID (used in throttled emits)

  useEffect(() => {
    currentDocIdRef.current = currentDocId;
  }, [currentDocId]);


// -----------------------------------------------------------------------------------------------
//                                        GRAPHQL CRD
// -----------------------------------------------------------------------------------------------


    /**
     * Fetches all the documents from the backend and populates the documents state.
     * 
     * @async
     * @throws                    Error if the fetch-operation fails
     * @returns {Promise<void>}
     */
      const getAllDocuments = async () => {
        try {
            const res = await graphQLClient.query(queries.GetDocuments);

            if (!res.ok) throw new Error(`Status: ${res.status}`);
    
            const body = await res.json();
            console.log(body);  // graphQL json structure   // DEV
            if (body.errors) throw new Error(body.errors[0].message);   // still status 200 on graphQL error

            // TODO: Let setDocuments recieve the documents array directly
            const modifiedBody = { data: body.data.documents }    // to fit old json-api structure
            setDocuments(body.data.documents);
        } catch (err) {
            console.error('Get all docs error', err);   // DEV
            alert(err.message);                         // DEV

            // alert('Sorry, could not retrieve the documents.');  // PROD
        }
    };


/**
   * Create a new default 'Untitled' document, with a Quill-based empty delta-object for
   * the empty initialized content.
   * 
   * @async
   * @throws                    Error if the create-operation fails
   * @returns {Promise<void>}
   */
    const createDocument = async () => {
      try {
        const variables = {
          title: "Untitled",
          content: { ops: [{ insert: "\n" }] },
          code: false,
          comments: []
        };

          const res = await graphQLClient.query(mutations.createDocument, variables);

          if (!res.ok) throw new Error(`Status: ${res.status}`);

          const body = await res.json();
          if (body.errors) throw new Error(body.errors[0].message);   // still status 200 on graphQL error
          
          console.log("New document with id: ", body.data.createDocument);    // DEV
          getAllDocuments();
          switchToViewMode();
      } catch (err) {
          console.error('Create doc error:', err);    // DEV
          alert(err.message);                     // DEV
          // alert("Failed to create document");     // PROD
      }
  };


  /**
     * Delete a document based on its id after user confirmation.
     * 
     * @async
     * @throws                     Error if the delete-operation fails
     * @returns {Promise<void>}
     */
  const deleteDocument = async (doc) => {
    if (
      window.confirm(
        `Are you sure you want to delete the document titled "${doc.title}" with _id "...${doc._id.slice(-5)}"?`
      )
    ) {
      try {
        const variables = {
          id: doc._id
        };
  
        const res = await graphQLClient.query(mutations.deleteDocument, variables);

  
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const body = await res.json();
  
        if (body.errors) {
          console.error("GraphQL Errors:", body.errors);
          throw new Error(body.errors[0].message);
        }
  
        await getAllDocuments();

          //...clear state and return to view-mode if the deleted doc was open
  
        if (doc._id === currentDocIdRef.current) {
          switchToViewMode();
        }
      } catch (err) {
        console.error("Delete doc error:", err);
        alert(err.message);
      }
    }
  };

// -----------------------------------------------------------------------------------------------
//                                NON-GRAPHQL SOCKET-RELATED JOIN-EDIT-DOCUMENT
// -----------------------------------------------------------------------------------------------

    /**
     * Join a document-edit (update) session based on its id and populate the state title and content.
     * 
     * It makes sure to retrieve the latest version from the backend rather than relying on 
     * the local documents state.
     * 
     * 
     * @async
     * @param {string} id         Document ID
     * @throws                     Error if the retrieval fails
     * @returns {Promise<void>}
     */
    const joinEditDocument = async (id) => {
      try {
        const res = await graphQLClient.query(queries.GetDocument, { id });
  
        if (!res.ok) throw new Error(`Failed to fetch document: ${id}`);
  
        const json = await res.json();
        const doc = json.data.document;
  
        setCurrentDocId(doc._id);
        setTitle(doc.title || "");
        setContent(doc.content || "");
        setUpdateId(doc._id);
        setMode("update");
  
        socketRef.current.emit("join-document-room", doc._id);
      } catch (err) {
        console.error("Load Document Error:", err);
      }
    };


// -----------------------------------------------------------------------------------------------
//                                        SOCKET
// -----------------------------------------------------------------------------------------------

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      getAllDocuments();
    });

    socket.on("document-updated", (doc) => {
      setDocuments((prev) =>
        prev.map((d) => (d._id === doc._id ? doc : d))
      );

      if (doc._id === currentDocIdRef.current) {
        setTitle(doc.title || "");
        setContent(doc.content || "");
      }
    });

    socket.on("document-title-updated", ({id, title}) => {
      if (id === currentDocIdRef.current) {
        setTitle(title || "");
      }
    });


    return () => {
      socket.disconnect();
      socketRef.current = "";
    };
  }, []);



  /**
   * Throttled socket-emitters - these experimental functions are used to limit how frequently
   * socket.emit is called during fast typing.
   *
   * Stored in a useRef-container, and employs useEffect to only be established once,
   * to persist across renders, without resetting the throttle timer (which would kind
   * of defeat the point).
   * 
   * (Might still prove useful for the more basic, uncomplicated title-updates, the content-delta flow
   * handles the throttling towards the db on the backend instead. To be decided.)
   */

  useEffect(() => {
    emitTitleUpdate.current = throttle((newTitle) => {
      if (currentDocIdRef.current) {
        socketRef.current.emit("update-document-title", {
          id: currentDocIdRef.current,
          title: newTitle
        });
      }
    }, 175);
  
    emitContentUpdate.current = throttle((delta) => {
      if (currentDocIdRef.current) {
        socketRef.current.emit("update-document-content", {
          id: currentDocIdRef.current,
          delta
        });
      }
    }, 0);
  }, []);

  

/**
 * These functions update the document’s title and content in local state while 
 * using throttled emitters to limit how often socket.emit is called during rapid typing.
 */

  const socketTitleChange = (newTitle) => {
    setTitle(newTitle);
    emitTitleUpdate.current(newTitle);
  };

  const socketContentChange = (delta) => {
    emitContentUpdate.current(delta);
  };

// -----------------------------------------------------------------------------------------------
//                                        VIEW/RESET
// -----------------------------------------------------------------------------------------------



  const switchToViewMode = () => {
    if (socketRef.current !== null) {
      socketRef.current.emit("leave-document-room", currentDocId);
    }
    resetState();
    getAllDocuments();
    setMode("view");
  };



  const resetState = () => {
    setTitle("");
    setContent("");
    setUpdateId(null);
    setChatDisplayed(false);
    setCommentsDisplayed(false)

  };

// -----------------------------------------------------------------------------------------------
//                                        RETURN & CUSTOM HOOK
// -----------------------------------------------------------------------------------------------


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
        createDocument,
        deleteDocument,
        joinEditDocument,
        getAllDocuments,
        socketTitleChange,
        socketContentChange,
        switchToViewMode,
        resetState,
        clientId,
        setClientId,
        localTitle,
        setLocalTitle,
        chatDisplayed,
        setChatDisplayed,
        commentsDisplayed,
        setCommentsDisplayed
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
