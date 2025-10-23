/**
 * @component CodeEditor
 * 
 * Socket-driven Monaco CodeEditor
 */

import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useCodeContext } from "./CodeContext";
import { useDocumentContext } from "../document-components/DocumentContext";
import CodeOutput from "./CodeOutput";

function CodeEditor() {

  const editorRef = useRef(null); // A Ref to store the Monaco editor instance

  const {
    codeContent,
    setCodeContent,
    codeTitle,
    setCodeTitle,
    currentCodeDocId,
    codeOutput,
    setCodeOutput,
    isRemoteChange,
    runCodeApi
  } = useCodeContext();

  const {
    socketRef
  } = useDocumentContext();


  const socket = socketRef.current;

  // -----------------------------------------------------------------------------------------------
  //                              Prepare To Mount The Editor
  // -----------------------------------------------------------------------------------------------

  const mountEditor = (editor) => {
    editorRef.current = editor;

    // Load the existing code or fallback to a default welcome message when empty
    const initialLoadValue =
      codeContent.code === null || codeContent.code === '' 
        ? "// Welcome! This code document is empty. Enjoy the coding!"
        : codeContent.code;
    editor.setValue(initialLoadValue);
    editor.updateOptions({ fontFamily: 'Menlo' });

  };

  // -----------------------------------------------------------------------------------------------
  //                               Local Content Change Emit
  // -----------------------------------------------------------------------------------------------
  const handleEditorChange = (newContent) => {
    if (isRemoteChange.current || !currentCodeDocId) return;

    // Emit content changes to other users in room
    socket.emit("update-code-content", {
      id: currentCodeDocId,
      code: newContent || "",
    });
  };

  // -----------------------------------------------------------------------------------------------
  //                               Local Title Change Emit
  // -----------------------------------------------------------------------------------------------
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setCodeTitle(newTitle);

    // Emit local title change to other users
    if (currentCodeDocId) {
      socket.emit("update-code-title", {
        id: currentCodeDocId,
        title: newTitle,
      });
    }
  };


  // -----------------------------------------------------------------------------------------------
  //                               Handle Remote Updates
  // -----------------------------------------------------------------------------------------------

  useEffect(() => {
    if (!socket || !currentCodeDocId) return;


    /**
     * Listen for incoming code content updates from other users. Uses a useRef isRemoteChange flag
     * to distinguish it from a local change and prevent an infine loop and unneccessary re-rendering.
     */
    socket.on("code-content-updated", ({ id, code }) => {
      if (id !== currentCodeDocId || typeof code !== "string") return;

      isRemoteChange.current = true;
      editorRef.current?.setValue(code);
      isRemoteChange.current = false;

      setCodeContent({ code });
    });

    /**
     * Listen for remote title updates and update local state
     */
    socket.on("code-title-updated", ({ id, title }) => {
      if (id !== currentCodeDocId || typeof title !== "string") return;
      setCodeTitle(title);
    });

    socket.on("code-error", ({ error }) => {
      console.error("Socket error:", error);
    });

    // Cleanup
    return () => {
      socket.off("code-content-updated");
      socket.off("code-title-updated");
      socket.off("code-error");

      if (currentCodeDocId) {
        socket.emit("leave-document-room", currentCodeDocId.current);
      }
    };
  }, [socket, currentCodeDocId]);


  // -----------------------------------------------------------------------------------------------
  //                               Render
  // -----------------------------------------------------------------------------------------------

  return (
    <>
      <input
        className="code-title-input" 
        type="text"
        value={codeTitle || ""}
        onChange={handleTitleChange}
        placeholder="Enter code title"
        
      />
      <div className="code-editor-container">
        <Editor
          height="400px"
          defaultLanguage="javascript"
          onMount={mountEditor}
          onChange={handleEditorChange}
        />
        <button className="code-button" onClick={() => runCodeApi(editorRef)} >➤ Run Code</button>
      </div>
      <CodeOutput output={codeOutput} />
    </>
  );
}

export default CodeEditor;
