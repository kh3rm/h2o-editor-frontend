
import React, { useEffect, useRef } from "react";
import { isEqual } from 'lodash';
import { useDocumentContext } from "./DocumentContext";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import Chat from '../view-components/Chat';
import Comments from '../view-components/Comments';

function DocumentForm() {
  const {
    content,
    socketContentChange,
    title,
    socketTitleChange,
    socketRef,
    clientId,
    setClientId,
    localTitle,
    setLocalTitle,
    chatDisplayed,
    setChatDisplayed,
    commentsDisplayed,
    setCommentsDisplayed,
    chatMessages,
    setChatMessages,
    currentDocIdRef,
    clientIdRef,
    chatInputValue,
    setChatInputValue
  } = useDocumentContext();

  const editorContainerRef = useRef(null);
  const quillEditorRef = useRef(null);
  const lastContent = useRef(content);
  const isHandlingRemoteContent = useRef(false);

  const socket = socketRef.current;

  const toggleChatVisibility = () => {
    setChatDisplayed(chatDisplayed => !chatDisplayed);
  };

  const toggleCommentsVisibility = () => {
      setCommentsDisplayed(commentsDisplayed => !commentsDisplayed);
  };



  // -----------------------------------------------------------------------------------------------
  //                   QUILL INITIALIZATION, SOCKET, QUILL-CONTENT-LOGIC, REMOTE TITLE UPDATE
  // -----------------------------------------------------------------------------------------------


  useEffect(() => {
    const quillContainer = document.createElement("div");

    if (editorContainerRef.current) {
      editorContainerRef.current.innerHTML = "";
      editorContainerRef.current.appendChild(quillContainer);
    }

    // Custom toolbar-options - to be further fine-tuned
    const TOOLBAR_OPTIONS = [
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ];

    const quill = new Quill(quillContainer, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
    });

    quillEditorRef.current = quill;


    /**
     * A fallback in case of loading an external corrupt db-addition: a document created in the app
     * should always have at the very minimum the default empty single newline quill-structured ops-content:
     * quill.setContents({ ops: [] }) --> { ops: [{ insert: "\n" }] }
     */
    if (content?.ops) {
      quill.setContents(content);
    } else {
      quill.setContents({ ops: [] });
    }

    lastContent.current = content;


    // Most reliable way to keep the socket-id-reference synched
    socket.on("socket-id", (id) => {
      clientIdRef.current = id;
      setClientId(id);
      console.log("Received my current socket id:", id);
    });
    

  
    /**
     * Sends the local user's content-changes as a delta to be processed and incorporated in the backend
     */
    const handleUserContentChange = (delta, oldDelta, source) => {
      if (source !== "user") return;

      socketContentChange(delta);
    };

    quill.on("text-change", handleUserContentChange);


    /**
     * Retrieves initial cached-document-state-content on join.
     */
    socket.on("document-initial-join", ({ content, msg }) => {
      const quill = quillEditorRef.current;
      if (!quill || !content?.ops) return;

      setChatMessages(prevMessages => [...prevMessages, msg]);

      isHandlingRemoteContent.current = true;
      quill.setContents(content);
      isHandlingRemoteContent.current = false;

      lastContent.current = content;
    });

    /**
     * Receives and sets local chat-message state from messages received from backend.
     */
    socket.on("chat-message-frontend", ({ id, msg }) => {
      if (id !== currentDocIdRef.current) return;
      setChatMessages(prevMessages => [...prevMessages, msg]);
    });


    /**
     * Listens for delta updates from other users in the document, and then applies
     * the update to the editor-content while preserving the local user's selection.
     */
    socket.on("remote-delta-content-change", ({ delta, author }) => {
      const quill = quillEditorRef.current;
      if (!quill || !delta?.ops?.length) return;

      if (author === clientId) return; // Ignore own delta

      const currentSelection = quill.getSelection();

      isHandlingRemoteContent.current = true;
      quill.updateContents(delta);
      isHandlingRemoteContent.current = false;

      if (currentSelection) {
        quill.setSelection(currentSelection.index, currentSelection.length);
      }
    });


    // ***NON-QUILL-RELATED REMOTE-TITLE-UPDATE***

    /**
     * Updates the local title to the newly updated, newly persisted title received back as confirmation
     * from the backend (user/remote initiated change alike).
     */
        socket.on("document-title-updated", ({ title }) => {
          setLocalTitle(title);
        });
    

    return () => {

      // Regular cleanup
      quill.off("text-change", handleUserContentChange);
      quillEditorRef.current = null;

      if (editorContainerRef.current) {
        editorContainerRef.current.innerHTML = "";
      }

      socket.off("remote-delta-content-change");
      socket.off("document-content-cached");
      socket.off("document-title-updated");
      socket.off("socket-id");
      socket.off("chat-message-frontend")

      setChatMessages([]);

      if (currentDocIdRef.current) {
        socket.emit("leave-document-room", currentDocIdRef.current);
      }
    };
  }, []);


  /**
   * Synchronizes the Quill editor's content with user-state content.
   *
   * This effect updates the Quill editor content only when it truly differs from the last applied content,
   * and it is _not_ during a current remote update that we’re already applying (isHandlingRemoteContent-flag).
   * 
   * It also looks to preserve the user's selection/cursor across updates. The deep comparison is done with lodash's isEqual().
   */
  useEffect(() => {
    const quill = quillEditorRef.current;
    if (!quill) return;

    const contentChanged = !isEqual(content, lastContent.current);

    if (!isHandlingRemoteContent.current && contentChanged) {
      const currentSelection = quill.getSelection();
      quill.setContents(content || { ops: [] });

      if (currentSelection) {
        quill.setSelection(currentSelection.index, currentSelection.length);
      }

      lastContent.current = content;
    }
  }, [content]);


  // -----------------------------------------------------------------------------------------------
  //                            NON-QUILL-RELATED BASIC LOCAL TITLE EMIT/UPDATE/SYNCH
  // -----------------------------------------------------------------------------------------------

  /**
   * Used to listen to changes in the title-input-form, set local title accordingly, emit changes
   * to backend (front-end experimental mild throttler still applied via socketTitleChange() in DocumentContext)
   */
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    socketTitleChange(newTitle);
  };

  /**
   * Keep localTitle in synch with title.
   */
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

// -----------------------------------------------------------------------------------------------
//                                          RENDER
// -----------------------------------------------------------------------------------------------  


  return (
    <>
    <div>
      <input
        className="document-title-input"
        type="text"
        value={localTitle || ""}
        onChange={handleTitleChange}
        placeholder="Enter a document title..."
      />
      <div className="quill-editor-container"
        ref={editorContainerRef}
      />
    </div>

      <Chat chatVisible={chatDisplayed} toggle={toggleChatVisibility} />
      <Comments commentsVisible={commentsDisplayed} toggle={toggleCommentsVisibility} />
    </>
  );
}

export default DocumentForm;
