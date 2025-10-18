import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useCodeContext } from "./CodeContext";
import CodeOutput from "./CodeOutput";

function CodeEditor() {

  const editorRef = useRef(null); // A Ref to store the Monaco editor instance

  const {
    socketRef,
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

  const socket = socketRef.current;

  // -----------------------------------------------------------------------------------------------
  //                              Prepare To Mount The Editor
  // -----------------------------------------------------------------------------------------------

  const mountEditor = (editor) => {
    editorRef.current = editor;

    // Load the existing content or fallback to a default welcome message when empty
    const initialLoadValue =
      codeContent.content === null || codeContent.content === '' 
        ? "// Welcome! This code document is empty. Enjoy the coding!"
        : codeContent.content;
    editor.setValue(initialLoadValue);
  };

  // -----------------------------------------------------------------------------------------------
  //                               Local Content Change Emit
  // -----------------------------------------------------------------------------------------------
  const handleEditorChange = (newContent) => {
    if (isRemoteChange.current || !currentCodeDocId) return;

    // Emit content changes to other users in room
    socket.emit("update-code-content", {
      id: currentCodeDocId,
      content: newContent || "",
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
    socket.on("code-content-updated", ({ id, content }) => {
      if (id !== currentCodeDocId || typeof content !== "string") return;

      isRemoteChange.current = true;
      editorRef.current?.setValue(content);
      isRemoteChange.current = false;

      setCodeContent({ content });
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
