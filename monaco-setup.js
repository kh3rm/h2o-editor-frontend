// monaco-setup.js

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';

self.MonacoEnvironment = {
  getWorker: function (_, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker();
    }
    if (label === 'json') {
      return new JsonWorker();
    }
    if (label === 'html') {
      return new HtmlWorker();
    }
    if (label === 'css') {
      return new CssWorker();
    }
    return new EditorWorker();
  }
};
