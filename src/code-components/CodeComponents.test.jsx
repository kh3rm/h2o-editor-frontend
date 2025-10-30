/**
 * @testcomponent CodeComponentsTest
 * 
 * Jest-component testing for the CodeEditor, the supporting CodeOutput components,
 * and tangentially, some of the enabling provider-context in CodeContext
 */

import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import CodeEditor from "./CodeEditor";
import CodeOutput from "./CodeOutput";
import { useCodeContext } from "./CodeContext";
import { useDocumentContext } from "../document-components/DocumentContext";

// Mock the Monaco Editor to simulate the code editor behavior
let mockOnChange = null;
const mockEditorInstance = {
  setValue: jest.fn(),
  updateOptions: jest.fn(),
  getValue: jest.fn(() => "console.log('test');"),
};

jest.mock("@monaco-editor/react", () => ({ onMount, onChange }) => {
  mockOnChange = onChange;
  onMount(mockEditorInstance);
  return <div data-testid="monaco-editor" />; // Only test-id in test-module, should be used sparingly (imo),
  // but for this unique imported integrated component I think it makes sense
});

// Mock CodeContext, DocumentContext for controlled testing
jest.mock("./CodeContext", () => ({
  useCodeContext: jest.fn(),
}));

jest.mock("../document-components/DocumentContext", () => ({
  useDocumentContext: jest.fn(),
}));


// Global fetch
global.fetch = jest.fn();
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("<CodeEditor /> and <CodeOutput />", () => {
  // Mock socket to simulate real-time collaboration
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn((event, callback) => {
      mockSocket._callbacks = mockSocket._callbacks || {};
      mockSocket._callbacks[event] = callback;
    }),
    off: jest.fn(),
    trigger: (event, data) => {
      if (mockSocket._callbacks && mockSocket._callbacks[event]) {
        mockSocket._callbacks[event](data);
      }
    },
  };
  // Default context with mock functions for CodeEditor-state management
  const defaultContext = {
    codeContent: { code: "// example" },
    setCodeContent: jest.fn(),
    codeTitle: "Doc Title",
    setCodeTitle: jest.fn(),
    currentCodeDocId: "mockdocid",
    codeOutput: null,
    setCodeOutput: jest.fn(),
    isRemoteChange: { current: false },
    // Mocked runCodeApi
    runCodeApi: jest.fn(async (editorRef) => {
      const code = editorRef.current?.getValue();
      if (!code) {
        console.log("Empty code editor content = No code to execute");
        return;
      }
      try {
        const res = await fetch("https://execjs.emilfolino.se/code", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: btoa(code) }),
        });
        const data = await res.json();
        const decoded = atob(data.data);
        console.log("Decoded output received back from API:", decoded);
        defaultContext.setCodeOutput(decoded);
      } catch (err) {
        console.error("Execution failed:", err);
        defaultContext.setCodeOutput(`Error: ${err.message}`);
      }
    }),
  };
  const defaultDocCtx = { socketRef: { current: mockSocket } };

  // Reset the mocks before each test to ensure clean state and slate
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket._callbacks = {};
    useCodeContext.mockReturnValue(defaultContext);
    useDocumentContext.mockReturnValue(defaultDocCtx);
  });

  // Perform cleanup after each test to prevent memory leaks
  afterEach(() => cleanup());

  //______________________________________________________________________________________________
  //
  //                   INITIALIZATION AND RENDERING
  //______________________________________________________________________________________________

  describe("Initialization and Rendering - confirming that it...", () => {

    // Verify that the CodeEditor renders with correct initial state and elements
    test("renders CodeEditor correctly with initial state", () => {
      render(<CodeEditor />);
      const titleInput = screen.getByPlaceholderText("Enter code title");
      expect(titleInput).toHaveValue("Doc Title");
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
      expect(mockEditorInstance.setValue).toHaveBeenCalledWith("// example");
      expect(screen.getByText("➤ Run Code")).toBeInTheDocument();
      expect(mockEditorInstance.updateOptions).toHaveBeenCalledWith({ fontFamily: "Menlo" });
      const outputContainer = screen.getByText("API Code Output (JS)").parentElement;
      expect(outputContainer).toHaveClass("code-output-container");
      expect(outputContainer).not.toHaveClass("active");
    });

    // Test editor initialization with undefined code content
    test("initializes editor with placeholder when codeContent is undefined", () => {
      useCodeContext.mockReturnValue({ ...defaultContext, codeContent: undefined });
      render(<CodeEditor />);
      expect(mockEditorInstance.setValue).toHaveBeenCalledWith(
        "// Welcome! This code document is empty. Enjoy the coding!"
      );
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter code title")).toHaveValue("Doc Title");
    });

    // Test editor initialization with null code
    test("initializes editor with placeholder when code is null", () => {
      useCodeContext.mockReturnValue({ ...defaultContext, codeContent: { code: null } });
      render(<CodeEditor />);
      expect(mockEditorInstance.setValue).toHaveBeenCalledWith(
        "// Welcome! This code document is empty. Enjoy the coding!"
      );
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter code title")).toHaveValue("Doc Title");
    });

    // Test editor initialization with empty code string
    test("initializes editor with placeholder when code is empty string", () => {
      useCodeContext.mockReturnValue({ ...defaultContext, codeContent: { code: "" } });
      render(<CodeEditor />);
      expect(mockEditorInstance.setValue).toHaveBeenCalledWith(
        "// Welcome! This code document is empty. Enjoy the coding!"
      );
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter code title")).toHaveValue("Doc Title");
    });

    // If !output: Verify CodeOutput renders correctly with no output container visible to user (!active)
    test("renders CodeOutput with null output", () => {
      render(<CodeOutput output={null} />);
      const outputHeader = screen.getByText("API Code Output (JS)");
      expect(outputHeader).toBeInTheDocument();
      const container = outputHeader.parentElement;
      expect(container).toHaveClass("code-output-container");
      expect(container).not.toHaveClass("active");
    });

    // If output: verify CodeOutput displays output and applies active class
    test("renders CodeOutput with non-null output and active class", () => {
      render(<CodeOutput output="API-returned code-output" />);
      expect(screen.getByText("API-returned code-output")).toBeInTheDocument();
      const container = screen.getByText("API-returned code-output").closest(".code-output-container");
      expect(container).toHaveClass("active");
      expect(screen.getByText("API Code Output (JS)")).toBeInTheDocument();
    });
  });

  //______________________________________________________________________________________________
  //
  //                   SOCKET CONNECTION HANDLING
  //______________________________________________________________________________________________

  describe("Socket Connection Handling - confirming that it...", () => {

    // Test socket listener setup for real-time updates
    test("registers socket listeners on mount", () => {
      render(<CodeEditor />);
      expect(mockSocket.on).toHaveBeenCalledWith("code-content-updated", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("code-title-updated", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("code-error", expect.any(Function));
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Ensure no socket listeners are registered without a socket
    test("does not register socket listeners when socket is null", () => {
      useDocumentContext.mockReturnValue({ socketRef: { current: null } });
      render(<CodeEditor />);
      expect(mockSocket.on).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter code title")).toHaveValue("Doc Title");
    });

    // Skip socket listeners if no document-ID is present
    test("does not register socket listeners when document-ID is null", () => {
      useCodeContext.mockReturnValue({ ...defaultContext, currentCodeDocId: null });
      render(<CodeEditor />);
      expect(mockSocket.on).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Verify socket listeners are removed on component unmount
    test("cleans up socket listeners on unmount", () => {
      const { unmount } = render(<CodeEditor />);
      unmount();
      expect(mockSocket.off).toHaveBeenCalledWith("code-content-updated");
      expect(mockSocket.off).toHaveBeenCalledWith("code-title-updated");
      expect(mockSocket.off).toHaveBeenCalledWith("code-error");
      expect(mockSocket.emit).toHaveBeenCalledWith("leave-document-room", "mockdocid");
    });

    // Test handling of socket errors
    test("handles socket code-errors", () => {
      useDocumentContext.mockReturnValueOnce({ socketRef: { current: null } });
      render(<CodeEditor />);
      expect(mockSocket.on).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();

      useDocumentContext.mockReturnValue(defaultDocCtx);
      render(<CodeEditor />);
      mockSocket.trigger("code-error", { error: "Socket failure" });
      expect(mockConsoleError).toHaveBeenCalledWith("Socket error:", "Socket failure");
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });

  //______________________________________________________________________________________________
  //
  //                   TITLE UPDATES
  //______________________________________________________________________________________________

  describe("Code Title Updates - confirming that it...", () => {

    // Test local title changes and socket emission
    test("handles title changes and emits socket events", () => {
      render(<CodeEditor />);
      const titleInput = screen.getByPlaceholderText("Enter code title");
      fireEvent.change(titleInput, { target: { value: "New Title" } });
      expect(defaultContext.setCodeTitle).toHaveBeenCalledWith("New Title");
      expect(mockSocket.emit).toHaveBeenCalledWith("update-code-title", { id: "mockdocid", title: "New Title" });
    });

    // Test title emission with empty title
    test("emits title update when new title is empty", () => {
      render(<CodeEditor />);
      const titleInput = screen.getByPlaceholderText("Enter code title");
      fireEvent.change(titleInput, { target: { value: "" } });
      expect(defaultContext.setCodeTitle).toHaveBeenCalledWith("");
      expect(mockSocket.emit).toHaveBeenCalledWith("update-code-title", { id: "mockdocid", title: "" });
    });

    // Skip title emission if no document ID
    test("skips title emission when document-ID is null", () => {
      useCodeContext.mockReturnValue({ ...defaultContext, currentCodeDocId: null });
      render(<CodeEditor />);
      const titleInput = screen.getByPlaceholderText("Enter code title");
      fireEvent.change(titleInput, { target: { value: "New Title" } });
      expect(defaultContext.setCodeTitle).toHaveBeenCalledWith("New Title");
      expect(mockSocket.emit).not.toHaveBeenCalledWith("update-code-title", expect.any(Object));
    });

    // Test updating title from socket event with matching ID
    test("updates code title when receiving socket title update for matching ID", () => {
      render(<CodeEditor />);
      mockSocket.trigger("code-title-updated", { id: "mockdocid", title: "Remote Title" });
      expect(defaultContext.setCodeTitle).toHaveBeenCalledWith("Remote Title");
    });

    // Ignore socket title updates for mismatched IDs
    test("ignores socket title update for mismatched ID", () => {
      render(<CodeEditor />);
      const titleInput = screen.getByPlaceholderText("Enter code title");
      mockSocket.trigger("code-title-updated", { id: "otherDoc", title: "Ignore this value update" });
      expect(defaultContext.setCodeTitle).not.toHaveBeenCalled();
      // Should still have same value - no update should have taken place
      expect(titleInput).toHaveValue("Doc Title");
    });

    // Skip title emission if socket is unavailable
    test("skips title emission when socket is null", () => {
      useDocumentContext.mockReturnValue({ socketRef: { current: null } });
      render(<CodeEditor />);
      const titleInput = screen.getByPlaceholderText("Enter code title");
      fireEvent.change(titleInput, { target: { value: "New Title" } });
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(defaultContext.setCodeTitle).toHaveBeenCalledWith("New Title");
    });

    // Ignore invalid socket title updates
    test("does not update title if title is not a string", () => {
      render(<CodeEditor />);
      mockSocket.trigger("code-title-updated", { id: "mockdocid", title: 123 });
      expect(defaultContext.setCodeTitle).not.toHaveBeenCalled();
      expect(screen.getByPlaceholderText("Enter code title")).toHaveValue("Doc Title");
    });
  });

  //______________________________________________________________________________________________
  //
  //                   CODE CONTENT UPDATES
  //______________________________________________________________________________________________

  describe("Code Content Updates - confirming that it...", () => {

    // Test local code changes and socket emission
    test("updates code content on editor change", () => {
      render(<CodeEditor />);
      mockOnChange("console.log('x');", {});
      expect(mockSocket.emit).toHaveBeenCalledWith("update-code-content", { id: "mockdocid", code: "console.log('x');" });
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Prevent emission for remote code changes - a key test
    test("does not emit code changes when isRemoteChange is true", () => {
      useCodeContext.mockReturnValue({ ...defaultContext, isRemoteChange: { current: true } });
      render(<CodeEditor />);
      mockOnChange("console.log('remote');", {});
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(defaultContext.setCodeContent).not.toHaveBeenCalled();
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Skip code emission if no document ID
    test("skips code emission when document ID is null", () => {
      useCodeContext.mockReturnValue({ ...defaultContext, currentCodeDocId: null });
      render(<CodeEditor />);
      mockOnChange("console.log('x');", {});
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Allow emission of empty code content
    test("allows code emission when new content is empty", () => {
      render(<CodeEditor />);
      mockOnChange("", {});
      expect(mockSocket.emit).toHaveBeenCalledWith("update-code-content", { id: "mockdocid", code: "" });
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Ignore socket code updates for mismatched IDs
    test("does not update code if socket emitted doc-ID mismatches", () => {
      render(<CodeEditor />);
      mockEditorInstance.setValue.mockClear();
      mockSocket.trigger("code-content-updated", { id: "wrong-id", code: "moot" });
      expect(defaultContext.setCodeContent).not.toHaveBeenCalled();
      expect(mockEditorInstance.setValue).not.toHaveBeenCalled();
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Ignore invalid socket code updates
    test("does not update code if socket event code is not a string", () => {
      render(<CodeEditor />);
      mockEditorInstance.setValue.mockClear();
      mockSocket.trigger("code-content-updated", { id: "mockdocid", code: 42 });
      expect(defaultContext.setCodeContent).not.toHaveBeenCalled();
      expect(mockEditorInstance.setValue).not.toHaveBeenCalled();
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Update code from socket event with matching ID
    test("updates code content and editor on receiving socket code-content-updated for matching ID", () => {
      render(<CodeEditor />);
      const newCode = "console.log('remote update');";
      mockEditorInstance.setValue.mockClear();
      defaultContext.setCodeContent.mockClear();
      mockSocket.trigger("code-content-updated", { id: "mockdocid", code: newCode });
      expect(defaultContext.setCodeContent).toHaveBeenCalledWith({ code: newCode });
      expect(mockEditorInstance.setValue).toHaveBeenCalledWith(newCode);
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });

    // Skip code emission if socket is unavailable
    test("skips code emission when socket is null", () => {
      useDocumentContext.mockReturnValue({ socketRef: { current: null } });
      render(<CodeEditor />);
      mockOnChange("console.log('test');", {});
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    });
  });

  //______________________________________________________________________________________________
  //
  //                   CODE EXECUTION AND API HANDLING
  //______________________________________________________________________________________________

  describe("Code Execution and API Handling - confirming that it...", () => {
    
    // Test successful code execution and output rendering
    test("executes runCodeApi and updates output", async () => {
      mockEditorInstance.getValue.mockReturnValue("console.log('Testing valid JS-code-log');");
      fetch.mockResolvedValueOnce({ json: async () => ({ data: btoa("Testing valid JS-code-log") }) });
      const { rerender } = render(<CodeEditor />);
      fireEvent.click(screen.getByText("➤ Run Code"));
      await waitFor(() => expect(defaultContext.setCodeOutput).toHaveBeenCalledWith("Testing valid JS-code-log"));
      useCodeContext.mockReturnValue({ ...defaultContext, codeOutput: "Testing valid JS-code-log" });
      rerender(<CodeEditor />);
      const outputElements = screen.getAllByText(/Testing valid JS-code-log/);
      expect(outputElements).toHaveLength(1);
      expect(outputElements[0]).toBeInTheDocument();
      const container = outputElements[0].closest(".code-output-container");
      expect(container).toHaveClass("active");
    });

    // Test proper handling of API errors
    test("handles runCodeApi API error correctly", async () => {
      mockEditorInstance.getValue.mockReturnValue("console.log('err');");
      fetch.mockRejectedValueOnce(new Error("API error"));
      const { rerender } = render(<CodeEditor />);
      fireEvent.click(screen.getByText("➤ Run Code"));
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith("Execution failed:", expect.any(Error));
        expect(defaultContext.setCodeOutput).toHaveBeenCalledWith("Error: API error");
      });
      useCodeContext.mockReturnValue({ ...defaultContext, codeOutput: "Error: API error" });
      rerender(<CodeEditor />);
      const outputElements = screen.getAllByText(/Error: API error/);
      expect(outputElements).toHaveLength(1);
      expect(outputElements[0]).toBeInTheDocument();
      const container = outputElements[0].closest(".code-output-container");
      expect(container).toHaveClass("active");
    });

    // Test rendering of JavaScript errors from API
    test("renders JS error message returned from API", async () => {
      mockEditorInstance.getValue.mockReturnValue("xyz()");
      fetch.mockRejectedValueOnce(new Error("SyntaxError: Unexpected token"));
      const { rerender } = render(<CodeEditor />);
      fireEvent.click(screen.getByText("➤ Run Code"));
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith("Execution failed:", expect.any(Error));
        expect(defaultContext.setCodeOutput).toHaveBeenCalledWith("Error: SyntaxError: Unexpected token");
      });
      useCodeContext.mockReturnValue({ ...defaultContext, codeOutput: "Error: SyntaxError: Unexpected token" });
      rerender(<CodeEditor />);
      const outputElements = screen.getAllByText(/Error: SyntaxError: Unexpected token/);
      expect(outputElements).toHaveLength(1);
      expect(outputElements[0]).toBeInTheDocument();
      const container = outputElements[0].closest(".code-output-container");
      expect(container).toHaveClass("active");
    });
  });


  //______________________________________________________________________________________________
  //
  //                         MISC EDGE CASES
  //______________________________________________________________________________________________

  describe("Edge Cases - confirming that it...", () => {

    // Test early return when editor reference is null and runCodeApi is executed
    test("returns early if editorRef.current is null", () => {
      const nullRefContext = { ...defaultContext, runCodeApi: jest.fn() };
      useCodeContext.mockReturnValue(nullRefContext);
      render(<CodeEditor />);
      fireEvent.click(screen.getByText("➤ Run Code"));
      expect(nullRefContext.runCodeApi).toHaveBeenCalledWith(expect.objectContaining({ current: expect.any(Object) }));
      expect(screen.getByText("API Code Output (JS)")).toBeInTheDocument();
      const container = screen.getByText("API Code Output (JS)").parentElement;
      expect(container).not.toHaveClass("active");
    });

    // Test handling of empty editor content runCodeApi execution
    test("handles execution of empty editor content as a non-event, does not render active output container", async () => {
      mockEditorInstance.getValue.mockReturnValue("");
      render(<CodeEditor />);
      fireEvent.click(screen.getByText("➤ Run Code"));
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith("Empty code editor content = No code to execute");
        expect(defaultContext.setCodeOutput).not.toHaveBeenCalled();
        expect(screen.getByText("API Code Output (JS)")).toBeInTheDocument();
        const container = screen.getByText("API Code Output (JS)").parentElement;
        expect(container).not.toHaveClass("active");
      });
    });
  
  });
});
