import React from "react";
import { useDocumentContext } from "./DocumentContext";

function CodeEditor() {
  const {
    content,
    socketContentChange,
    title,
    socketTitleChange,
    clientId,
    setClientId,
    localTitle,
    setLocalTitle
  } = useDocumentContext();




// -----------------------------------------------------------------------------------------------
//                                          RENDER
// -----------------------------------------------------------------------------------------------  


return (
  <div>
    <h2>CodeEditor implementation goes here...</h2>

  <textarea
    defaultValue="Monaco Editor coming up..."
    style={{
    marginBottom: "1rem",
    height: "700px",
    width: "100%",
    fontSize: "1.25rem",
    padding: "0.5rem",
    marginTop: "2rem",
    backgroundColor: "gray",
    }}
  />

  </div>
);

}

export default CodeEditor;
