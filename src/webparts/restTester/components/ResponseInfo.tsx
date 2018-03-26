import * as React from 'react';
import styles from './RestTester.module.scss';
import { ActionButton } from 'office-ui-fabric-react/lib/components/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import AceEditor from 'react-ace';
import SnippetBuilder from './SnippetBuilder';
import { ResultType, IRequestInfo } from './RestTester';
import jsonToTS from 'json-to-ts';

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
        <p className={ styles.title }>API Result {this.props.status && `- Status code: ${this.props.status}`}</p>

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
            <AceEditor mode="json"
                      theme="github"
                      className={styles.codeZone}
                      value={restResponse}
                      readOnly={true}
                      editorProps={{ $blockScrolling: true }}
                      setOptions={{
                        wrap: this.props.wrapCode,
                        showPrintMargin: false,
                        maxLines: restResponse ? restResponse.split(/\r\n|\r|\n/).length : 15
                      }}
                      width="100%" />
          )
        }
        {
          this.props.resultType === ResultType.interface && (
            <AceEditor mode="typescript"
                      theme="github"
                      className={styles.codeZone}
                      value={interfaceObj}
                      readOnly={true}
                      editorProps={{ $blockScrolling: true }}
                      setOptions={{
                        wrap: this.props.wrapCode,
                        showPrintMargin: false,
                        maxLines: interfaceObj ? interfaceObj.split(/\r\n|\r|\n/).length : 15
                      }}
                      width="100%" />
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
