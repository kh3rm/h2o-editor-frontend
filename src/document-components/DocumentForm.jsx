import React from "react";
import { useDocumentContext } from "./DocumentContext";

/**
 * @component DocumentForm
 * Handles the loading of the document-form, for document creation/update.
 */
function DocumentForm() {
  const {
    title,
    content,
    socketTitleChange,
    socketContentChange,
  } = useDocumentContext();

  return (
    <div className="document-form">
      <label htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        name="title"
        value={title}
        onChange={(e) => socketTitleChange(e.target.value)}
      />

      <label htmlFor="content">Content</label>
      <textarea
        id="content"
        name="content"
        value={content}
        onChange={(e) => socketContentChange(e.target.value)}
      ></textarea>
      <br />
    </div>
  );
}

export default DocumentForm;
