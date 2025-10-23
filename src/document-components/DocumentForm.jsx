/**
 * @component DocumentForm
 * Socket-driven Quill-editor
 */

import React, { useEffect, useRef, useState } from "react";
import { useDocumentContext } from "./DocumentContext";
import Quill, { Delta } from "quill";
import "quill/dist/quill.snow.css";
import Chat from "../view-components/Chat";
import Comments from "../view-components/Comments";
import addSvg from "../img/add.svg";

function DocumentForm() {
  // --------------------------------------------------------------------------------
  //                                   Context and State Setup
  // --------------------------------------------------------------------------------
  
  const {
    content,
    socketContentChange,
    localTitle,
    setLocalTitle,
    socketTitleChange,
    socketRef,
    chatDisplayed,
    setChatDisplayed,
    commentsDisplayed,
    setCommentsDisplayed,
    currentDocIdRef,
    chatMessages,
    setChatMessages
  } = useDocumentContext();

  const editorContainerRef = useRef(null);
  const quillEditorRef = useRef(null);
  const [commentSelection, setCommentSelection] = useState(null);
  const [comments, setComments] = useState({});
  const socket = socketRef.current;

  // --------------------------------------------------------------------------------
  //                              Custom Blot Registration
  // --------------------------------------------------------------------------------
  
  // Registers the custom inline comment-blot that wraps a text-selection in a <span> element, containing comment-id
  // and data-comment (class set to "comment-quill"). 

  // Leverages Quills brilliant delta op-based structure and inner machinery to be able to create, store, update and delete
  // comments in relation to a given text-selection in a structured way, enabling realtime sync with sockets and delta driven
  // updates, sidestepping the need for frail, shaky, dubious index-adjusting logic for the comments for all changes
  // made in the document, and the need for separate db-persistance.

  const Inline = Quill.import("blots/inline");

  class CommentBlot extends Inline {
    static blotName = "comment";
    static tagName = "span";
    static className = "comment-quill";

    static create(value) {
      const commentSpan = super.create();
      commentSpan.setAttribute("comment-id", value.id);
      commentSpan.setAttribute("data-comment", value.commentData);
      return commentSpan;
    }

    static formats(domNode) {
      return {
        id: domNode.getAttribute("comment-id"),
        commentData: domNode.getAttribute("data-comment"),
      };
    }

    format(name, value) {
      if (name === "comment" && value) {
        this.domNode.setAttribute("comment-id", value.id);
        this.domNode.setAttribute("data-comment", value.commentData);
      } else {
        super.format(name, value);
      }
    }

    static value(domNode) {
      const commentId = domNode.getAttribute("comment-id");
      const commentText = domNode.getAttribute("data-comment");
      if (commentId) {
        return { id: commentId, commentData: commentText };
      }
      return null;
    }
  }

  Quill.register(CommentBlot);

  // --------------------------------------------------------------------------------
  //                 Comment Retrieval From Custom Blots In Document
  // --------------------------------------------------------------------------------
  
  const retrieveCommentsFromDeltaDoc = (deltaDoc) => {
    if (!deltaDoc || !deltaDoc.ops) return {};
    const newComments = {};
    deltaDoc.ops.forEach((op) => {
      if (op.attributes?.comment) {
        const { id, commentData } = op.attributes.comment;
        if (id && commentData != null) {
          newComments[id] = {
            id,
            text: commentData,
            content: typeof op.insert === "string" ? op.insert : "",
          };
        }
      }
    });
    return newComments;
  };

  // --------------------------------------------------------------------------------
  //                                 Quill Editor Setup
  // --------------------------------------------------------------------------------
  
  useEffect(() => {
    // Initialize the Quill editor
    const container = document.createElement("div");
    if (editorContainerRef.current) {
      editorContainerRef.current.innerHTML = "";
      editorContainerRef.current.appendChild(container);
    }

    // Establish toolbar with customized options
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

    // Quill editor instantiation
    const quill = new Quill(container, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    quillEditorRef.current = quill;

    // Set initial content
    if (content?.ops && content.ops.length > 0) {
      quill.setContents(content);
      setComments(retrieveCommentsFromDeltaDoc(content));
    } else {
      quill.setContents({ ops: [] });
      setComments({});
    }


  // --------------------------------------------------------------------------------
  //                                Quill Editor/Socket - Handlers
  // --------------------------------------------------------------------------------


    // Handle selection changes (pertaining to index, range, text and position)
    quill.on("selection-change", (range, oldRange, source) => {
      if (!range || range.length === 0 || source !== "user") {
        setCommentSelection(null);
        return;
      }

      // Boilerplate orientational logic to locate the selection's position in the DOM
      const bounds = quill.getBounds(range);
      const editorElem = editorContainerRef.current.querySelector(".ql-editor");
      const editorRect = editorElem.getBoundingClientRect();
      const toolbarElem = editorContainerRef.current.querySelector(".ql-toolbar");
      const toolbarHeight = toolbarElem?.getBoundingClientRect().height || 0;

      // Sets selection-data in state to be used in blot-creation and add-comment-button-positioning
      setCommentSelection({
        range,
        text: quill.getText(range.index, range.length),
        position: {
          top: bounds.top + editorRect.top + window.scrollY + editorElem.scrollTop - toolbarHeight,
          left: bounds.left + editorRect.left + window.scrollX,
          height: bounds.height,
        },
      });
    });

    // Handles local text changes
    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return;
      socketContentChange(delta);
      const newContents = quill.getContents();
      setComments(retrieveCommentsFromDeltaDoc(newContents));
    });

    // Handles remote delta updates
    socket.on("remote-delta-content-change", ({ delta, author }) => {
      if (!quill) return;
      if (author === socket.id) return;
      const quillDelta = new Delta(delta);
      quill.updateContents(quillDelta, "api");
      const updatedComments = retrieveCommentsFromDeltaDoc(quill.getContents());
      setComments(updatedComments);
    });

    // Handles title updates
    socket.on("document-title-updated", ({ id, title }) => {
      if (id !== currentDocIdRef.current) return;
      setLocalTitle(title);
    });

    // Handles chat messages
    socket.on("chat-message-frontend", ({ id, msg }) => {
      if (id !== currentDocIdRef.current) return;
      setChatMessages((prev) => {
        const newMessages = [...prev, msg];
        setChatMessages(newMessages);
        return newMessages;
      });
    });

    // Handles the initial data-retrieval from the backend as a user joins a document room
    socket.on("document-initial-join", ({ id, content, title }) => {
      if (id !== currentDocIdRef.current) return;
      if (content?.ops && content.ops.length > 0) {
        quill.setContents(content);
        setComments(retrieveCommentsFromDeltaDoc(content));
      }
      setLocalTitle(title || "");
    });

    // Handle socket errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // -----------------------------------------------------------------------------------

    // Set Comments component visible on mount
    setCommentsDisplayed(true);

    // -----------------------------------------------------------------------------------

    // Cleanup
    return () => {
      quill.off("selection-change");
      quill.off("text-change");
      socket.off("remote-delta-content-change");
      socket.off("document-title-updated");
      socket.off("chat-message-frontend");
      socket.off("document-initial-join");
      socket.off("error");

      setChatMessages([]);

      // Emit leave-document-room with the current docId
      if (currentDocIdRef.current) {
        socket.emit("leave-document-room", currentDocIdRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------------
  //                                Comments Update Effect
  // --------------------------------------------------------------------------------
  
  // Updates the commentsDisplayed dynamically (that are fed to the Comments-component and shown there)
  useEffect(() => {
    if (commentsDisplayed && quillEditorRef.current) {
      const currentContents = quillEditorRef.current.getContents();
      const updatedComments = retrieveCommentsFromDeltaDoc(currentContents);
      setComments((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(updatedComments)) {
          return updatedComments;
        }
        return prev;
      });
    }
  }, [commentsDisplayed]);




  // --------------------------------------------------------------------------------
  //                              Custom Blot Comment Handlers
  // --------------------------------------------------------------------------------
  

  // Handles the creation of a custom comment blot in relation to a given selection
  const handleCommentBlotCreate = (newCommentText) => {
    const quill = quillEditorRef.current;
    const selection = quill.getSelection();
    if (!selection || selection.length === 0) return;

    const text = quill.getText(selection.index, selection.length);
    if (!text.trim()) return;

    // Elementary way to randomize an id that is going to be plenty unique enough for this implementation
    const commentId = Date.now().toString();

    // First delete the given selection, then insert the new comment-custom-blot in its place, spanning the
    // same text that was just deleted, the randomized id and the given comment submitted by the user 
    const commentDelta = new Delta()
      .retain(selection.index)
      .delete(selection.length)
      .insert(text, { comment: { id: commentId, commentData: newCommentText },
      });

    
    // Update the quill editor-contents with the comment-blot-delta, set the comments based on this new
    // state, emit the change out, reset the selection state
    quill.updateContents(commentDelta, "user");
    const updatedContents = quill.getContents();
    setComments(retrieveCommentsFromDeltaDoc(updatedContents));
    socketContentChange(commentDelta);
    setCommentSelection(null);
  };


  // Handles the edit of a given comment (uses commentId to identify)
  const handleCommentEdit = (commentId, newText) => {
    if (!newText.trim()) return;

    const quill = quillEditorRef.current;
    const span = quill.root.querySelector(`span.comment-quill[comment-id="${commentId}"]`);
    if (!span) return;

    const blot = Quill.find(span);
    const index = quill.getIndex(blot);
    const text = blot.domNode.innerText;

    // Similar procedure as in the creation of the blot: first delete the earlier blots span,
    // and then insert the new updated blot with the same commentId and the user's submitted
    // edited text
    const delta = new Delta()
      .retain(index)
      .delete(text.length)
      .insert(text, { comment: { id: commentId, commentData: newText } });

    // Update contents, emit change, update and set the new comments-state
    quill.updateContents(delta, "user");
    socketContentChange(delta);
    const updatedComments = retrieveCommentsFromDeltaDoc(quill.getContents());
    setComments(updatedComments);
  };

  // Handles the deletion of a given comment (uses commentId)
  const handleCommentDelete = (commentId) => {
    const quill = quillEditorRef.current;
    const span = quill.root.querySelector(`span.comment-quill[comment-id="${commentId}"]`);
    if (!span) return;

    const blot = Quill.find(span);
    if (!blot) return;

    const index = quill.getIndex(blot);
    const text = blot.domNode.innerText;

    // Again similar syntax, only here we delete the blot, and in its place insert the text
    // pertaining to the previous comment. Blot gone, text remains = comment deleted
    const delta = new Delta()
      .retain(index)
      .delete(text.length)
      .insert(text);

    // Update contents, emit change, update and set the new comments-state
    quill.updateContents(delta, "user");
    socketContentChange(delta);
    const updatedComments = retrieveCommentsFromDeltaDoc(quill.getContents());
    setComments(updatedComments);
  };

  // --------------------------------------------------------------------------------
  //                                        Render
  // --------------------------------------------------------------------------------
  
  return (
    <>
      <input
        className="document-title-input"
        type="text"
        value={localTitle || ""}
        onChange={(e) => {
          setLocalTitle(e.target.value);
          socketTitleChange(e.target.value);
        }}
        placeholder="Enter a document title..."
      />
      <div className="quill-editor-container" ref={editorContainerRef} />

      {commentSelection && commentSelection.text.trim() && (
        <div
          style={{
            position: "absolute",
            top: Math.max(0, commentSelection.position.top -2),
            left: commentSelection.position.left,
            zIndex: 1000,
          }}
        >
          <button
            className="add-comment-button"
            onClick={() => {
              const commentText = prompt("Enter your comment:");
              if (commentText?.trim()) {
                handleCommentBlotCreate(commentText.trim());
              }
            }}
          >
            <img
              className="add-svg"
              src={addSvg}
              alt="addSvg"
              style={{ width: 29, height: 29 }}
            />
          </button>
        </div>
      )}

      <Chat
        chatVisible={chatDisplayed}
        toggle={() => setChatDisplayed((p) => !p)}
        messages={chatMessages}
      />
      <Comments
        commentsVisible={commentsDisplayed}
        toggle={() => setCommentsDisplayed((p) => !p)}
        comments={comments}

        highlightComment={(commentId) => {
          const quill = quillEditorRef.current;
          const span = quill.root.querySelector(`span.comment-quill[comment-id="${commentId}"]`);
          if (span) {
            const blot = Quill.find(span);
            const index = quill.getIndex(blot);
            quill.setSelection(index, span.innerText.length, "user");
          }
        }}

        editComment={handleCommentEdit}
        deleteComment={handleCommentDelete}
      />
    </>
  );
}

export default DocumentForm;
