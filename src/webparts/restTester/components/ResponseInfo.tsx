import * as React from 'react';
import styles from './RestTester.module.scss';
import { ActionButton } from 'office-ui-fabric-react/lib/components/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import AceEditor from 'react-ace';
import SnippetBuilder from './SnippetBuilder';
import { ResultType, IRequestInfo } from './RestTester';
import jsonToTS from 'json-to-ts';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/components/MessageBar';
import CodeEditor, { CodeLanguage } from './CodeEditor';

export interface IResponseInfoProps {
  status: number | string;
  resultType: ResultType;
  wrapCode: boolean;
  requestInfo: IRequestInfo;
  data: string;

  fSwitchTab: (val: ResultType) => void;
  fTriggerCodeWrap: (ev: React.FormEvent<HTMLElement>, isChecked: boolean) => void;
}

export interface IResponseInfoState {}

export default class ResponseInfo extends React.Component<IResponseInfoProps, IResponseInfoState> {
  public render(): React.ReactElement<IResponseInfoProps> {
    // Stringify the rest response
    const restResponse: string = this.props.data ? JSON.stringify(this.props.data, null, 2) : "";
    // Create the TS interface
    const interfaceObj: string = this.props.data ? jsonToTS(this.props.data).join("\n\n") : "";

    return (
      <div className={styles.resultSection}>
        <p className={ styles.title }>API Result</p>

        {
          this.props.status && (
            <MessageBar className={styles.respMessageBar} messageBarType={(this.props.status >= 200 && this.props.status < 300) ? MessageBarType.success : MessageBarType.error}>
              Status code: {this.props.status} {(this.props.requestInfo && this.props.requestInfo.absUrl) && <span>- Called URL: {this.props.requestInfo.absUrl}</span>}
            </MessageBar>
          )
        }

        <div className={styles.tabs}>
          <ActionButton onClick={() => this.props.fSwitchTab(ResultType.body)} className={`${this.props.resultType === ResultType.body && styles.selectedTab}`}>
            Response preview
          </ActionButton>

          <ActionButton onClick={() => this.props.fSwitchTab(ResultType.interface)} className={`${this.props.resultType === ResultType.interface && styles.selectedTab}`}>
            TypeScript interface
          </ActionButton>

          <ActionButton onClick={() => this.props.fSwitchTab(ResultType.codeSnippet)} className={`${this.props.resultType === ResultType.codeSnippet && styles.selectedTab}`}>
            SPFx code snippet
          </ActionButton>

          <Checkbox label='Wrap code?'
                    className={styles.codeWrap}
                    checked={this.props.wrapCode}
                    onChange={this.props.fTriggerCodeWrap} />
        </div>

        {
          this.props.resultType === ResultType.body && (
            // <AceEditor mode="json"
            //           theme="github"
            //           className={styles.codeZone}
            //           value={restResponse}
            //           readOnly={true}
            //           editorProps={{ $blockScrolling: true }}
            //           setOptions={{
            //             wrap: this.props.wrapCode,
            //             showPrintMargin: false,
            //             maxLines: restResponse ? restResponse.split(/\r\n|\r|\n/).length : 15
            //           }}
            //           width="100%" />
            <CodeEditor value={restResponse} language={CodeLanguage.json} />
          )
        }
        {
          this.props.resultType === ResultType.interface && (
            // <AceEditor mode="typescript"
            //           theme="github"
            //           className={styles.codeZone}
            //           value={interfaceObj}
            //           readOnly={true}
            //           editorProps={{ $blockScrolling: true }}
            //           setOptions={{
            //             wrap: this.props.wrapCode,
            //             showPrintMargin: false,
            //             maxLines: interfaceObj ? interfaceObj.split(/\r\n|\r|\n/).length : 15
            //           }}
            //           width="100%" />
            <CodeEditor value={interfaceObj} language={CodeLanguage.typescript} />
          )
        }
        {
          this.props.resultType === ResultType.codeSnippet && (
            <SnippetBuilder requestInfo={this.props.requestInfo} wrapCode={this.props.wrapCode} />
          )
        }
      </div>
    );
  }
}
