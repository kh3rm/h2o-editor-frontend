import React from "react";

function CodeOutput({ output }) {
  const hasOutput = !!output;

  return (
    <div className={`code-output-container ${hasOutput ? "active" : ""}`}>

      <h2 className="code-output-header">API Code Output (JS)</h2>
      
      <div className="code-output-inner-container">
        {hasOutput && <p>{String(output)}</p>}
      </div>

    </div>
  );
}

export default CodeOutput;
