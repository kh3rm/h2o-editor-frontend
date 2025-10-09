
import React, { useEffect, useRef, useState } from "react";
import { useDocumentContext } from "./DocumentContext";
import Quill from "quill";
import "quill/dist/quill.snow.css";

/**
 * @component DocumentForm
 * Component implementing a Quill-editor, updating document title and content through live socket-updates.
 */
function DocumentForm() {
  const {
    content,
    socketContentChange,
    title,
    socketTitleChange,
  } = useDocumentContext();

  const editorContainerRef = useRef(null); // The DOM-container element
  const quillEditorRef = useRef(null);    // The Quill-instance mounted inside the DOM-container

  const isOwnUpdate = useRef(false);
  const lastContent = useRef(content);

  const [localTitle, setLocalTitle] = useState(title);

  /**
   * Create and populate a container for Quill editor only once on mount, preventing
   * problems with duplicate toolbars etc.
   */
  useEffect(() => {
    
    const quillContainer = document.createElement("div");

    if (editorContainerRef.current) {
      editorContainerRef.current.innerHTML = "";
      editorContainerRef.current.appendChild(quillContainer);
    }

    // Custom Quill toolbar options
    const TOOLBARCUSTOMOPTIONS = [
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

    // Initialize Quill editor with main-theme "snow" and the custom toolbar.
    const quill = new Quill(quillContainer, {
      theme: "snow",
      modules: { toolbar: TOOLBARCUSTOMOPTIONS },
    });


    quillEditorRef.current = quill;


    if (content?.ops) {
      quill.setContents(content);
    } else {
      quill.setContents({ ops: [] });
    }


    // Track current content to prevent redundant updates
    lastContent.current = content;

    /**
     * Handlers user-originated content-changes. Uses a flag to avoid sending unneccesary socket
     * updates back to this client. Sends updated content over socket.
     */
    const handleUserContentChange = (delta, oldDelta, source) => {
      if (source === "user") {
        const currentContent = quill.getContents();

        isOwnUpdate.current = true;

        socketContentChange(currentContent);

        lastContent.current = currentContent;
      }
    };

    // The actual handler that listens for text changes made by the user
    quill.on("text-change", handleUserContentChange);

    // Cleanup
    return () => {
      quill.off("text-change", handleUserContentChange);
      quillEditorRef.current = null;
      if (editorContainerRef.current) {
        editorContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  /**
   * Effect to sync external content updates received via socket into the Quill editor.
   */
  useEffect(() => {
    const quill = quillEditorRef.current;
    if (!quill) return;

    const hasContentChanged = JSON.stringify(content) !== JSON.stringify(lastContent.current);

    if (!isOwnUpdate.current && hasContentChanged) {
  
      const currentSelection = quill.getSelection();

      if (content?.ops) {
        quill.setContents(content);
      } else {
        quill.setContents({ ops: [] });
      }
      lastContent.current = content;

      // Restore cursor position to (try to) maintain user-editing-context
      if (currentSelection) {
        quill.setSelection(currentSelection.index, currentSelection.length);
      }
    }

    isOwnUpdate.current = false;
  }, [content]);

  // Handle the less common title-changes: update local state, send the updates through socket
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    socketTitleChange(newTitle);
  };

  /**
   * Sync external title updates into local state
   */
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  return (
    <div>
      <input
        className="document-title"
        type="text"
        value={localTitle || ""}
        onChange={handleTitleChange}
        placeholder="Enter a document title..."
        style={{ marginBottom: "1rem", width: "100%" }}
      />
      <div style={{ height: "400px" }} ref={editorContainerRef} />
    </div>
  );
}

export default DocumentForm;
