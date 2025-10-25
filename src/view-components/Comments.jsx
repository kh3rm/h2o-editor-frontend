/**
 * @component Comments
 * Comments component, showcasing the commments retrieved from the custom blots, in relation to
 * the spanned text that they pertain to, with added highlight, edit and delete functionality.
 */


import React, { useState } from "react";
import penSvg from "../img/pen.svg";

function Comments({ commentsVisible, toggle, comments, highlightComment, editComment, deleteComment }) {
  const [commentEditId, setCommentEditId] = useState(null);
  const [commentEditText, setCommentEditText] = useState("");

  // --------------------------------------------------------------------------------
  //                   Edit Comment Handlers
  // --------------------------------------------------------------------------------

  // Set and handle the edit-comment state
  const handleEditStart = (id, currentText) => {
    setCommentEditId(id);
    setCommentEditText(currentText);
  };

  // Execute editComment (passed as prop from DocumentFrom): if valid edit-comment state, update the
  // given blot's comment-text (comment-data) inside the quill content
  const handleEditSave = () => {
    if (commentEditId && commentEditText.trim()) {
      editComment(commentEditId, commentEditText.trim());
    }
    setCommentEditId(null);
    setCommentEditText("");
  };


  // --------------------------------------------------------------------------------
  //                            Render
  // --------------------------------------------------------------------------------

  return (
    <>
      <button className="comments-button" onClick={toggle}>
        <img src={penSvg} alt="Comments" style={{ width: 20, height: 20 }} />
      </button>

      <div className={`comments-container ${commentsVisible ? "visible" : ""}`}>
        <h3 className="comments-header">Comments</h3>
        <div className="comments-inner-container">
          {/* Map through all the comments set in state and render them in separate containers, showcasing the
          comment and the comment-text it refers to, also adding edit and delete buttons. Clicking a given comment
          will highlight it (= set selection) in the quill editor. */}
          {Object.keys(comments).length === 0 ? (
            <p>No comments yet</p>
          ) : (
            Object.entries(comments).map(([id, comment]) => (
              <div
                key={id}
                className="single-comment-container"
                onClick={() => highlightComment?.(id)}
              >
                {commentEditId === id ? (
                  <input
                    type="text"
                    className="comment-edit-input"
                    value={commentEditText}
                    autoFocus
                    onChange={(e) => setCommentEditText(e.target.value)}
                    onBlur={handleEditSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEditSave();
                      }
                    }}
                  />
                ) : (
                  <>
                    <span className="single-comment-container-comment">
                      {comment.comment}
                    </span>
                    {/* Delete button*/}
                    <button
                      className="single-comment-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteComment?.(id);
                      }}
                    >☒</button>
                    {/* Edit button*/}
                    <button
                      className="comment-edit-input-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(id, comment.comment);
                      }}
                    >✎</button>
                  </>
                )}
                {/* Keep the referenced comment text short and sweet to not take up unneccesary place in the container*/}
                {comment.commentedText && (
                  <div className="single-comment-container-text">
                    Relating to: "
                    {comment.commentedText.length > 12
                      ? comment.commentedText.slice(0, 12) + "..."
                      : comment.commentedText}
                    "
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Comments;
