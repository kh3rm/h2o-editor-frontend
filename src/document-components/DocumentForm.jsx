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
// import addSvg from "../img/add.svg";
import addSvg from "../img/pen.svg";

function DocumentForm() {
  // -----------------------------------------------------------------------------------------
  //                                   Context and State Setup
  // -----------------------------------------------------------------------------------------
  
  const {
    content,
    title,
    setTitle,
    socketRef,
    chatDisplayed,
    setChatDisplayed,
    commentsDisplayed,
    setCommentsDisplayed,
    currentDocIdRef,
    chatMessages,
    setChatMessages,
    user
  } = useDocumentContext();

  const editorContainerRef = useRef(null);
  const quillEditorRef = useRef(null);
  const [commentSelection, setCommentSelection] = useState(null);
  const [comments, setComments] = useState({});
  const socket = socketRef.current;

  // -----------------------------------------------------------------------------------------
  //                              Custom Blot Registration
  // -----------------------------------------------------------------------------------------
  
  // Registers the custom inline comment-blot that wraps a text-selection in a <span> element, each containing
  // comment-id, username and data-comment (class set to "comment-quill"). 

  // Leverages Quills brilliant delta op-based structure and Parchment-driven inner machinery to be able to create, store,
  // update and delete comments in relation to a given text-selection in a structured way, enabling realtime sync with
  // sockets and delta driven updates, sidestepping the need for frail, shaky, dubious index-adjusting logic for the
  // comments for all changes made in the document, and the necessity of separate comment db-persistance.

  const Inline = Quill.import("blots/inline");

  class CommentBlot extends Inline {
    static blotName = "comment";
    static tagName = "span";
    static className = "comment-quill";

    static create(value) {
      const commentSpan = super.create();
      commentSpan.setAttribute("comment-id", value.id);
      commentSpan.setAttribute("username", value.username)
      commentSpan.setAttribute("data-comment", value.commentData);
      return commentSpan;
    }

    static formats(domNode) {
      return {
        id: domNode.getAttribute("comment-id"),
        username: domNode.getAttribute("username"),
        commentData: domNode.getAttribute("data-comment"),
      };
    }

    format(name, value) {
      if (name === "comment" && value) {
        this.domNode.setAttribute("comment-id", value.id);
        this.domNode.setAttribute("username", value.username);
        this.domNode.setAttribute("data-comment", value.commentData);
      } else {
        super.format(name, value);
      }
    }

    static value(domNode) {
      const commentId = domNode.getAttribute("comment-id");
      const username = domNode.getAttribute("username")
      const commentText = domNode.getAttribute("data-comment");
      if (commentId) {
        return { id: commentId, username, commentData: commentText};
      }
      return null;
    }
  }

  Quill.register(CommentBlot);

  // -----------------------------------------------------------------------------------------
  //                 Comment Retrieval From Custom Blots In Document
  // -----------------------------------------------------------------------------------------
  
  // Loop through all the ops in the document content, pick out all the custom comment blots,
  // and for each, retrieve the id, username, comment and commented text, and return complete object.
  // It will be set in state and used inside the Comments-component to render and showcase all the comments.
  const retrieveAllComments = (deltaDoc) => {
    if (!deltaDoc || !deltaDoc.ops) return {};
    const allComments = {};
    deltaDoc.ops.forEach((op) => {
      if (op.attributes?.comment) {
        const { id, commentData, username } = op.attributes.comment;
        if (id && commentData != null) {
          const insert = typeof op.insert === "string" ? op.insert : "";
          if (!insert.trim()) return;
          if (!allComments[id]) {
            allComments[id] = {
              id,
              comment: commentData,
              commentedText: insert,
              username,
            };
          } else {
            allComments[id].commentedText += insert;
          }
        }
      }
    });
    // Trim whitespaces and remove orphaned comments
    Object.keys(allComments).forEach((id) => {
      allComments[id].commentedText = allComments[id].commentedText.trim();
      if (!allComments[id].commentedText) {
        delete allComments[id];
      }
    });
    return allComments;
  };

  // -----------------------------------------------------------------------------------------
  //                                 Quill Editor Setup
  // -----------------------------------------------------------------------------------------
  
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
      setComments(retrieveAllComments(content));
    } else {
      quill.setContents({ ops: [] });
      setComments({});
    }
  

  // -----------------------------------------------------------------------------------------
  //                    Selection Handling
  // -----------------------------------------------------------------------------------------


    // Handle selection changes (pertaining to index, range, text and position)
    quill.on("selection-change", (range, oldRange, source) => {
      if (!range || range.length === 0 || source !== "user") {
        setCommentSelection(null);
        return;
      }
      
      // Get the native browser selection
      const nativeSelection = window.getSelection();
      if (!nativeSelection.rangeCount) {
        setCommentSelection(null);
        return;
      }
    
      // Extract selection, calculate rendered selection-rectangle viewport coordinates
      const selectionRange = nativeSelection.getRangeAt(0);
      const selectionRectangle = selectionRange.getBoundingClientRect();
      
      // Set selection-data, to be used for button-positioning
      setCommentSelection({
        range,
        position: {
          top: selectionRectangle.top + window.scrollY - 50,
          left: selectionRectangle.left + window.scrollX,
        },
      });
    });




  // -----------------------------------------------------------------------------------------
  //                  Quill Content Updates Local / Remote
  // -----------------------------------------------------------------------------------------


    // Handle local editor content text-changes: emit content change, set new Comments-state based on new contents
    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return;
      emitContentChange(delta);
      const newContents = quill.getContents();
      setComments(retrieveAllComments(newContents));
    });

    // Handle remote delta updates: if delta is not sent from the client itself (author): apply incoming delta with
    // quill's inbuilt updateContents(), and set new Comments-state based on new contents
    socket.on("remote-delta-content-change", ({ delta, author }) => {
      if (!quill) return;
      if (author === socketRef.current?.id) return;
      const quillDelta = new Delta(delta);
      quill.updateContents(quillDelta, "api");
      const updatedComments = retrieveAllComments(quill.getContents());
      setComments(updatedComments);
    });
  


  // -----------------------------------------------------------------------------------------
  //                  Title Updates Remote
  // -----------------------------------------------------------------------------------------


    // Handle basic remote title updates: (socket.to-emitted = never own update) receive title, set title, done
    socket.on("document-title-updated", ({ id, title }) => {
      if (id !== currentDocIdRef.current) return;
      setTitle(title);
    });


  // -----------------------------------------------------------------------------------------
  //                  Chat
  // -----------------------------------------------------------------------------------------


    // Handle chat messages: receive message from backend, append into the chatMessage-array state
    socket.on("chat-message-frontend", ({ id, msg }) => {
      if (id !== currentDocIdRef.current) return;
      setChatMessages((prev) => {
        const newMessages = [...prev, msg];
        setChatMessages(newMessages);
        return newMessages;
      });
    });


  // -----------------------------------------------------------------------------------------
  //                  Initial Join
  // -----------------------------------------------------------------------------------------


    // Handle the initial data-retrieval from the backend as a user joins a document room
    socket.on("document-initial-join", ({ id, content, title }) => {
      if (id !== currentDocIdRef.current) return;
      if (content?.ops && content.ops.length > 0) {
        quill.setContents(content);
        setComments(retrieveAllComments(content));
      }
      if (!title) {
        setTitle(title);
      }
      
    });

  
  // -----------------------------------------------------------------------------------------
  //                 Socket Error
  // -----------------------------------------------------------------------------------------

    // Handle socket errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // --------------------------------------------------------------------------------------------

    // Set Comments component visible on mount
    setCommentsDisplayed(true);

    // --------------------------------------------------------------------------------------------

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



  // -----------------------------------------------------------------------------------------
  //                Content / Title Emitters
  // -----------------------------------------------------------------------------------------

  // Emit the Quill change delta to backend for processing
  const emitContentChange = (delta) => {
    if (currentDocIdRef.current) {
      socketRef.current.emit("update-document-content", {
        id: currentDocIdRef.current,
        delta,
        author: socket.id
      });
    }
  };

  // Emit the simpler title-change to backend for processing
  const emitTitleChange = (newTitle) => {
    if (currentDocIdRef.current) {
      socketRef.current.emit("update-document-title", {
        id: currentDocIdRef.current,
        title: newTitle,
      });
    }
  };



  // -----------------------------------------------------------------------------------------
  //                  Handle Title Change
  // -----------------------------------------------------------------------------------------

  // Handle local changes in the title-form. On change: set title and emit out
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    emitTitleChange(newTitle);
  };


  // -----------------------------------------------------------------------------------------
  //                Custom Blot Comment Handlers
  // -----------------------------------------------------------------------------------------
  

  // Handle the creation of a custom comment blot in relation to a given selection
  const commentBlotCreate = (newCommentText) => {
    const quill = quillEditorRef.current;
    const selection = quill.getSelection();
    if (!selection || selection.length === 0) return;

    const text = quill.getText(selection.index, selection.length);
    if (!text.trim()) return;

    // Elementary way to establish an id that is going to be plenty unique enough for this implementation
    const commentId = Date.now().toString();

    // Retrieve any previously existing formatting for the selected text
    const existingFormats = quill.getFormat(selection.index, selection.length);

    // Merge existing formats with the new comment attribute
    const newAttributes = {
      ...existingFormats,
      comment: { id: commentId, username: user.name, commentData: newCommentText },
    };

    // First delete the given selection, then insert the new comment-custom-blot in its place,
    // spanning the same text that was just deleted, the randomized id and the given comment
    // submitted by the user, whilst preserving all previous formatting.
    const commentDelta = new Delta()
      .retain(selection.index)
      .delete(selection.length)
      .insert(text, newAttributes);

    // Update the quill editor-contents with the comment-blot-delta, emit the change out,
    // set the comments based on this new state, and reset the selection state
    quill.updateContents(commentDelta, "user");
    const updatedContents = quill.getContents();
    emitContentChange(commentDelta);

    setComments(retrieveAllComments(updatedContents));
    setCommentSelection(null);
  };


  // Handle the edit of a given comment (uses commentId to identify)
  const commentBlotEdit = (commentId, newText) => {
    if (!newText.trim()) return;

    const quill = quillEditorRef.current;
    const span = quill.root.querySelector(`span.comment-quill[comment-id="${commentId}"]`);
    if (!span) return;

    const blot = Quill.find(span);
    const index = quill.getIndex(blot);
    const text = blot.domNode.innerText;

    // Retrieve existing formatting for this comment's text range
    const existingFormats = quill.getFormat(index, text.length);

    // Merge existing formats with updated comment attribute
    const newAttributes = {
      ...existingFormats,
      comment: { id: commentId, username: existingFormats.comment?.username, commentData: newText },
    };

    // Similar procedure as in the creation of the blot: first delete the earlier blots span-text,
    // and then insert the new updated blot with the same commentId and the user's submitted
    // edited text, whilst preserving existing formatting.
    const delta = new Delta()
      .retain(index)
      .delete(text.length)
      .insert(text, newAttributes);

    // Update content, emit change, update and set the new comments-state
    quill.updateContents(delta, "user");
    emitContentChange(delta);
    const updatedComments = retrieveAllComments(quill.getContents());
    setComments(updatedComments);
  };



  // Handle the deletion of a given comment (uses commentId), implementing slightly more elaborate
  // logic to handle the deletion and proper reset of comments spanning multiple lines.
  // Deletes the comment blot-span and inserts the text again, whilst preserving
  // any other styling (bold, italic, color, etc.) that may exist on the text.
  const commentBlotDelete = (commentId) => {
    const quill = quillEditorRef.current;
    const spans = quill.root.querySelectorAll(`span.comment-quill[comment-id="${commentId}"]`);
    if (!spans.length) return;

    let currentPos = 0;
    let delta = new Delta();
    
    // Sort spans based on index, to enable proper deletion of a blot-comment spanning multiple lines
    const sortedSpans = Array.from(spans).sort((a, b) => {
      const blotA = Quill.find(a);
      const blotB = Quill.find(b);
      return quill.getIndex(blotA) - quill.getIndex(blotB);
    });

    sortedSpans.forEach((span) => {
      const blot = Quill.find(span);
      const index = quill.getIndex(blot);
      const text = blot.domNode.innerText;

      // Retrieve existing formats at this range
      const formats = quill.getFormat(index, text.length);

      // Remove the comment attribute but keep all other formatting intact
      const cleanedFormats = { ...formats };
      delete cleanedFormats.comment;

      delta = delta
        .retain(index - currentPos)
        .delete(text.length)
        .insert(text, cleanedFormats);

        // Remove the blot span, insert only the text, maintaining previous formatting:
        // Blot gone, text remains = comment deleted

      currentPos = index + text.length;
    });

    // Update contents, emit change, update and set the new comments-state
    quill.updateContents(delta, "user");
    emitContentChange(delta);
    const updatedComments = retrieveAllComments(quill.getContents());
    setComments(updatedComments);
  };





  // -----------------------------------------------------------------------------------------
  //                    Provide Cypress Access To Comment Blot Functions
  // -----------------------------------------------------------------------------------------

  useEffect(() => {
      window.__H2O_EDITOR_TEST_API__ = {
        commentBlotCreate,
        commentBlotEdit,
        commentBlotDelete,
        getQuill: () => quillEditorRef.current,
      };
    return () => {
      // Clean up to prevent stale refs
      if (window.__H2O_EDITOR_TEST_API__) {
        delete window.__H2O_EDITOR_TEST_API__;
      }
    };
  }, []);




  // -----------------------------------------------------------------------------------------
  //                                        Render
  // -----------------------------------------------------------------------------------------
  
  return (
    <>
      <input
        className="document-title-input"
        type="text"
        value={title || ""}
        onChange={handleTitleChange}
        placeholder="Enter a document title..."
      />
      <div className="quill-editor-container" ref={editorContainerRef} />

      {/* If selection: render the add-comment-button above it, which when clicked triggers a prompt
      that will take user comment input, that will be used to create a new custom comment blot span with that comment data
      in relation to the active selection*/}
      {commentSelection && (
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
                commentBlotCreate(commentText.trim());
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
        /* Props sent to Chat-component below */
        chatVisible={chatDisplayed}
        toggle={() => setChatDisplayed((p) => !p)}
        messages={chatMessages}
      />
      <Comments
        /* Props sent to Comment-component below */
        commentsVisible={commentsDisplayed}
        toggle={() => setCommentsDisplayed((p) => !p)}
        comments={comments}
        
        // Function that enables highlighting in quill editor when clicking a given comment in the Comments-sidebar
        highlightComment={(commentId) => {
          const quill = quillEditorRef.current;
          const spans = quill.root.querySelectorAll(`span.comment-quill[comment-id="${commentId}"]`);
          if (!spans.length) return;
        
          // Sort the querySelected spans relating to the comment in correct indexed order
          const sortedSpans = Array.from(spans).sort((a, b) => {
            const blotA = Quill.find(a);
            const blotB = Quill.find(b);
            return quill.getIndex(blotA) - quill.getIndex(blotB);
          });
        
          // Get index of the first blot
          const firstBlot = Quill.find(sortedSpans[0]);
          const startIndex = quill.getIndex(firstBlot);
        
          // Compute selection length
          const lastBlot = Quill.find(sortedSpans[sortedSpans.length - 1]);
          const endIndex = quill.getIndex(lastBlot) + lastBlot.length();
          const selectionLength = endIndex - startIndex;
        
          // Apply the selection
          quill.setSelection(startIndex, selectionLength, "user");
        
          // Ensure visibility
          quill.scrollSelectionIntoView();
        }}
        
        // Function that enables editing for every comment in the Comments-sidebar
        editComment={commentBlotEdit}
        // Function that enables deletion for every comment in the Comments-sidebar
        deleteComment={commentBlotDelete}
      />
    </>
  );
}

export default DocumentForm;