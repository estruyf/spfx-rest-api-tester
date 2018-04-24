import * as React from 'react';
import { SPComponentLoader } from '@microsoft/sp-loader';

// import * as monaco from 'monaco-editor';

declare const AMDLoader: any;
// declare const requirejs: any;
// import * as requirejs from 'requirejs';
declare const monaco: any;
declare const global: any;
declare const requirejs: any;


// https://github.com/Microsoft/monaco-editor/issues/759
// https://github.com/timkendrick/monaco-editor-samples/blob/feature/worker-context-fallbacks/browser-esm-webpack/webpack.config.js

export enum CodeLanguage {
  json = 1,
  typescript
}

export interface ICodeEditorProps {
  value: string;
  language: CodeLanguage
}

export interface ICodeEditorState {}

export default class CodeEditor extends React.Component<ICodeEditorProps, ICodeEditorState> {
  // private _editor: monaco.editor.IStandaloneCodeEditor;
  private _codeElm: HTMLElement = null;

  constructor(props: ICodeEditorProps) {
    super(props);

    this.state = {

    };
  }

  public componentDidMount(): void {
    // (window as any).MonacoEnvironment = {
    //   getWorkerUrl: function (moduleId, label) {
    //     console.log(moduleId, label);
    //     if (label === 'json') {
    //       return './json.worker.js';
    //     }
    //     if (label === 'typescript' || label === 'javascript') {
    //       return './ts.worker.js';
    //     }
    //     return './editor.worker.js';
    //   }
    // }

    // this._codeElm = document.getElementById('container');
    // this._editor = monaco.editor.create(this._codeElm, {
    //   value: this.props.value,
    //   language: this.props.language ? CodeLanguage[this.props.language] : CodeLanguage[CodeLanguage.typescript],
    //   theme: 'vs-dark',
    //   readOnly: true,
    //   scrollBeyondLastLine: false,
    //   folding: true
    // });

    this._loadScripts();
  }

  public componentDidUpdate(prevProps: ICodeEditorProps, prevState: ICodeEditorState): void {
    if (prevProps.value !== this.props.value) {
      // this._loadScripts();
    }
  }

  private async _loadScripts() {
    // this._editor.setValue(this.props.value);
    // this._codeElm.style.height = `${this._editor.getScrollHeight()}px`;
    // this._editor.layout();

    // var nodeRequire = (window as any).require;

    // (window as any).require = undefined;
    // (window as any).requirejs = undefined;
    // (window as any).define = undefined;
    // delete (window as any).require;
    // delete (window as any).requirejs;
    // delete (window as any).define;

    // SPComponentLoader.loadScript('https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js', { globalExportsName: 'requirejs' }).then((customRequire: any) => {
    // (window as any).require(['https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/vs/loader.js'], () => {

      // require('../loader/customLoader.js');
      // debugger;
      // AMDLoader.init();

      // (window as any).require = nodeRequire;
      // (window as any).require.nodeRequire = (window as any).require;

      // const amdRequire = AMDLoader.global.require;
      // (self as any).module = undefined;
      // debugger;
      // const amdRequire = (window as any).require;

      // console.log(customRequire);
      // console.log(customRequire.config);

      // customRequire.config({
      (window as any).require.config({
      // (window as any).require.config({
      // amdRequire.config({
      // eval('require').config({
        // baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min'
        paths: {
          'vs': ['https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/vs']
        }
      });

      const proxy = URL.createObjectURL(new Blob([`
        self.MonacoEnvironment = {
          baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/'
        };
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/vs/base/worker/workerMain.js');
      `], { type: 'text/javascript' }));


      (window as any).MonacoEnvironment = {
        getWorkerUrl: (workerId, label) => {
          console.log(workerId, label);
          return proxy;
        }
      };

      // customRequire(['vs/editor/editor.main'], () => {
      (window as any).require(['vs/editor/editor.main'], function () {
      // (window as any).require(['vs/editor/editor.main'], () => {
      // eval('require')(['vs/editor/editor.main'], () => {
        // debugger;
        let editor = monaco.editor.create(document.getElementById('container'), {
          value: [
            'const x = () => {',
            '\tconsole.log("Hello world!");',
            '}'
          ].join('\n'),
          language: 'typescript',
          theme: 'vs-dark'
        });
      });
    // });

    // debugger;

    // AMDLoader.config({
		// 	baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/'
    // });

    // // workaround monaco-css not understanding the environment
		// self["module"] = undefined;
		// // workaround monaco-typescript not understanding the environment
		// self["process"].browser = true;
		// AMDLoader(['vs/editor/editor.main'], () => {
		// 	var editor = monaco.editor.create(document.getElementById('container'), {
		// 		value: [
		// 			'function x() {',
		// 			'\tconsole.log("Hello world!");',
		// 			'}'
		// 		].join('\n'),
		// 		language: 'javascript'
		// 	});
		// });

    // monaco.editor.create(document.getElementById('container'), {
    //   value: this.props.value,
    //   language: 'typescript'
    // });



    // (window as any).MonacoEnvironment = {
    //   getWorkerUrl: function (moduleId, label) {
    //     console.log(moduleId, label);
    //     if (label === 'json') {
    //       return './json.worker.js';
    //     }
    //     if (label === 'typescript' || label === 'javascript') {
    //       return './ts.worker.js';
    //     }
    //     return './editor.worker.js';
    //   }
    // }



    // await SPComponentLoader.loadScript('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/vs/loader.js', { globalExportsName: 'requirejs' });

    // if (requirejs) {
    //   requirejs.config({
    //     baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min'
    //     // paths: {
    //     //   'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/vs'
    //     // }
    //   });

    //   let proxy = URL.createObjectURL(new Blob([`
    //     console.log('From within the file contents');
    //     self.MonacoEnvironment = {
    //       baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/'
    //     };
    //     importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.11.1/min/vs/base/worker/workerMain.js');
    //   `], { type: 'text/javascript' }));

    //   (window as any).MonacoEnvironment = {
    //     getWorkerUrl: (workerId, label) => {
    //       console.log(workerId, label);
    //       return 'monaco-editor-worker-loader-proxy.js';
    //     }
    //   };

    //   requirejs(['vs/editor/editor.main'], () => {
    //     let editor = monaco.editor.create(document.getElementById('container'), {
    //       value: [
    //         'function x() {',
    //         '\tconsole.log("Hello world!");',
    //         '}'
    //       ].join('\n'),
    //       language: 'javascript',
    //       theme: 'vs-dark'
    //     });
    //   });
    // }
  }

  public render(): React.ReactElement<ICodeEditorProps> {
    return (
      <div style={{position:"relative"}}>
        <div id="container" style={{ position: "absolute", top: 0, bottom: 0, width: "100%", height: "500px" }} />
      </div>
    );
  }
}
