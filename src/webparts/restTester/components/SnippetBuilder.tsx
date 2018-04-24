import * as React from 'react';
import styles from './RestTester.module.scss';
// import styles from './SnippetBuilder.module.scss';
import * as brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/typescript';
import 'brace/theme/github';
import 'brace/ext/searchbox';
import { IRequestInfo } from './RestTester';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import * as beautify from 'js-beautify';
import CodeEditor, { CodeLanguage } from './CodeEditor';

export interface ISnippetBuilderProps {
  requestInfo: IRequestInfo;
  wrapCode: boolean;
}

export interface ISnippetBuilderState {
  code: string;
}

const codeSnippet = `const apiUrl = \`{apiUrl}\`;
this.context.spHttpClient.fetch(apiUrl, SPHttpClient.configurations.v1, {
  method: {requestType}{headers}{body}
})
.then((data: SPHttpClientResponse) => data.json())
.then((data: any) => {
  // Write your code here
});`;

export default class SnippetBuilder extends React.Component<ISnippetBuilderProps, ISnippetBuilderState> {
  constructor(props: ISnippetBuilderProps) {
    super(props);

    this.state = {
      code: codeSnippet
    };
  }

  public componentDidMount(): void {
    this._updateCodeSnippet(this.props);
  }

  public componentWillReceiveProps(nextProps: ISnippetBuilderProps): void {
    this._updateCodeSnippet(nextProps);
  }

  /**
   * Update the tokens in the body and URL
   */
  private _updateTokens = (val: string) => {
    val = val.replace(/{webUrl}/g, "${this.context.pageContext.web.absoluteUrl}");
    val = val.replace(/{webId}/g, "${this.context.pageContext.web.id}");
    val = val.replace(/{listId}/g, "${this.context.pageContext.list.id}");
    val = val.replace(/{itemId}/g, "${this.context.pageContext.listItem.id}");
    val = val.replace(/{siteId}/g, "${this.context.pageContext.site.id}");
    val = val.replace(/{userId}/g, "${this.context.pageContext.legacyPageContext.userId}");
    return val;
  }

  private _updateCodeSnippet = (props: ISnippetBuilderProps) => {
    if (!props.requestInfo) {
      this.setState({
        code: ""
      });
      return;
    }

    let snippet = codeSnippet;

    // Update the API URL
    let apiUrl = props.requestInfo.url;
    apiUrl = this._updateTokens(apiUrl);
    snippet = snippet.replace("{apiUrl}", apiUrl);

    // Update the request type
    snippet = snippet.replace("{requestType}", `"${props.requestInfo.method}"`);

    // Update the headers if there were any provided
    if (isEmpty(props.requestInfo.headers)) {
      snippet = snippet.replace("{headers}", "");
    } else {
      snippet = snippet.replace("{headers}", `,
  headers: ${JSON.stringify(props.requestInfo.headers, null, 4)}`);
    }

    // Update the body if it is a post request
    if (props.requestInfo.method === "POST" && props.requestInfo.body) {
      snippet = snippet.replace("{body}", `,
  body: JSON.stringify({body})`);
      let body = props.requestInfo.body;
      body = this._updateTokens(body);
      snippet = snippet.replace("{body}", body);
    } else {
      snippet = snippet.replace("{body}", "");
    }

    // Used "as any" because unindent_chained_methods is a new setting and not yet in the typings
    this.setState({
      code: beautify(snippet, { indent_size: 2, unindent_chained_methods: true } as any)
    });
  }

  public render(): React.ReactElement<ISnippetBuilderProps> {
    return (
      // <AceEditor mode="typescript"
      //            theme="github"
      //            className={styles.codeZone}
      //            value={this.state.code}
      //            readOnly={true}
      //            editorProps={{ $blockScrolling: true }}
      //            setOptions={{
      //              wrap: this.props.wrapCode,
      //              showPrintMargin: false,
      //              maxLines: this.state.code.split(/\r\n|\r|\n/).length
      //            }}
      //            width="100%" />

      <CodeEditor value={this.state.code} language={CodeLanguage.typescript} />
    );
  }
}
