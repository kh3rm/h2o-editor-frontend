// CodeContext.js

/**
 * Slimmed down Context-provider for the code-related functionality.
 */

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import documentsService from "../services/documents";

import { useDocumentContext } from "../document-components/DocumentContext";

export const CodeContext = createContext();

export const CodeProvider = ({ children }) => {
  const socketRef = useRef(null);

  const [codeTitle, setCodeTitle] = useState("");
  const [codeContent, setCodeContent] = useState("");

  const [localCodeTitle, setLocalCodeTitle] = useState("");
  const [clientCodeId, setClientId] = useState(null);

  const [codeUpdateId, setCodeUpdateId] = useState(null);
  const [codeMode, setCodeMode] = useState("view");

  const [codeOutput, setCodeOutput] = useState(null);

  const [currentCodeDocId, setCurrentCodeDocId] = useState(null);

  const currentCodeDocIdRef = useRef(null);

  const isRemoteChange = useRef(false); // Flag to prevent emitting out remote socket updates in an endless loop

  // Borrowed in from DocumentContext
  const { setMode, getAllDocuments} = useDocumentContext();

  

  useEffect(() => {
    currentCodeDocIdRef.current = currentCodeDocId;
  }, [currentCodeDocId]);

  // -----------------------------------------------------------------------------------------------
  //                               Open Code Editor
  // -----------------------------------------------------------------------------------------------

  const openCodeEditor = async (id) => {
    try {
      const doc = await documentsService.getOne(id);

      setCurrentCodeDocId(doc._id);
      setCodeTitle(doc.title || "");
      setCodeContent(doc.content || "");
      setCodeUpdateId(doc._id);
      setMode("code-edit");
      socketRef.current.emit("join-code-document-room", doc._id);
    } catch (err) {
      console.error("Load Code Document Error:", err);
    }
  };

  // -----------------------------------------------------------------------------------------------
  //                                   API Code Output
  // -----------------------------------------------------------------------------------------------
  
  
  const runCodeApi = async (monacoEditorRef) => {
    if (!monacoEditorRef.current) return;

    const codeToRun = monacoEditorRef.current.getValue();
    console.log("codeToRun", codeToRun);

    const data = {
      code: btoa(codeToRun)
    };

    try {
      const response = await fetch("https://execjs.emilfolino.se/code", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      const decodedOutput = atob(result.data);
      console.log("Decoded output received back from API:", decodedOutput);

      // Updates the codeOutput-state with the decoded response from the API, to be showcased
      // in the output-container flanking the code-editor to the right
      setCodeOutput(decodedOutput);

    } catch (error) {
      console.error("Execution failed:", error);
      setCodeOutput(`Error: ${error.message}`);
    }
  };


  // -----------------------------------------------------------------------------------------------
  //                                        SOCKET
  // -----------------------------------------------------------------------------------------------

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Code-socket connected:", socket.id);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);


  // -----------------------------------------------------------------------------------------------
  //                                        RESET / VIEW
  // -----------------------------------------------------------------------------------------------


  const switchToViewModeCode = () => {
    if (socketRef.current && currentCodeDocId) {
      socketRef.current.emit("leave-code-document-room", currentCodeDocId);
    }
    resetStateCode();
    getAllDocuments();
    setMode("view");
  };

  const resetStateCode = () => {
    setCodeTitle("");
    setCodeContent("");
    setCodeUpdateId(null);
    setCurrentCodeDocId(null);
    setCodeOutput(null);
  };

  // -----------------------------------------------------------------------------------------------
  //                                        RETURN & CUSTOM HOOK
  // -----------------------------------------------------------------------------------------------

  return (
    <CodeContext.Provider
      value={{
        codeTitle,
        setCodeTitle,
        localCodeTitle,
        setLocalCodeTitle,
        codeContent,
        setCodeContent,
        codeOutput,
        setCodeOutput,
        codeMode,
        setCodeMode,
        codeUpdateId,
        setCodeUpdateId,
        currentCodeDocId,
        setCurrentCodeDocId,
        currentCodeDocIdRef,
        socketRef,
        openCodeEditor,
        switchToViewModeCode,
        resetStateCode,
        clientCodeId,
        setClientId,
        runCodeApi,
        isRemoteChange
      }}
    >
      {children}
    </CodeContext.Provider>
  );
};

export const useCodeContext = () => useContext(CodeContext);
