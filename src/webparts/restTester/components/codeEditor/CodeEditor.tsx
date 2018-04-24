import * as React from 'react';
import { ICodeEditorProps, ICodeEditorState } from '.';
// import styles from './CodeEditor.module.scss';

// Desired editor features
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import 'monaco-editor/esm/vs/editor/contrib/folding/folding.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

// Languages definitions
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

export class CodeEditor extends React.Component<ICodeEditorProps, ICodeEditorState> {
  private codeElm: HTMLElement = null;
  private editor: monaco.editor.IStandaloneCodeEditor = null;

  constructor(props: ICodeEditorProps) {
    super(props);

    this.state = {
      uniqueId: `RestApiCodeEditor${this.generateUniqueID()}`
    };

    const proxy = URL.createObjectURL(new Blob([`
      self.MonacoEnvironment = {
        baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.12.0/min/'
      };
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.12.0/min/vs/base/worker/workerMain.js');
    `], { type: 'text/javascript' }));

    // Register the Monaco Environment
    (self as any).MonacoEnvironment = {
      getWorkerUrl: (moduleId, label) => {
        return proxy;
      }
    };
  }

  /**
   * componentDidMount lifecycle hook
   */
  public componentDidMount(): void {
    this.bindCode();
  }

  /**
   * componentDidUpdata lifecycle hook
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: ICodeEditorProps, prevState: ICodeEditorState): void {
    if (prevProps.code !== this.props.code) {
      this.editor.setValue(this.props.code);
      this.updateLayout();
    }

    if (prevProps.language !== this.props.language) {
      monaco.editor.setModelLanguage(this.editor.getModel(), this.props.language);
    }

    if (prevProps.wordWrap !== this.props.wordWrap) {
      this.editor.updateOptions({ wordWrap: this.props.wordWrap ? "on" : "off" });
    }
  }

  /**
   * Bind the properties for the code editor
   */
  private bindCode(): void {
    this.codeElm = document.getElementById(this.state.uniqueId);
    // Clear all
    this.codeElm.innerHTML = "";
    this.editor = monaco.editor.create(this.codeElm, {
      value: this.props.code,
      language: this.props.language,
      theme: 'vs-dark',
      readOnly: this.props.readOnly,
      wordWrap: this.props.wordWrap ? "on" : "off",
      scrollBeyondLastLine: false,
      automaticLayout: true,
      folding: true
    });

    // Change the layout
    this.updateLayout();

    // Bind onChange event
    if (this.props.onChange) {
      this.editor.onDidChangeModelContent((event) => {
        this.props.onChange(this.editor.getValue());
      });
    }
  }

  /**
   * Update the layout
   */
  private updateLayout() {
    if (this.codeElm && this.editor) {
      this.codeElm.style.height = `${this.editor.getScrollHeight()}px`;
      this.editor.layout();
    }
  }

  /**
   * Generate an unique ID for the code element
   */
  private generateUniqueID(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Default React render
   */
  public render(): React.ReactElement<ICodeEditorProps> {
    return (
      <div id={this.state.uniqueId} style={{ width: "100%", height: this.props.height ? this.props.height : "500px" }} />
    );
  }
}
