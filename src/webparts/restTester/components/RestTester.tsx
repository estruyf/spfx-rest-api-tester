import * as React from 'react';
import styles from './RestTester.module.scss';
import { IRestTesterProps } from './IRestTesterProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import * as brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/mode/typescript';
import 'brace/theme/github';
import 'brace/ext/searchbox';
import HeadersInput from './HeadersInput';
import SnippetBuilder from './SnippetBuilder';
import ResponseInfo from './ResponseInfo';
import ApiSuggestions from './ApiSuggestions';

/**
 * TODO: Allow other API support (not MS Graph)
 * - Check for SP URL or MS Graph (show URL to Graph Explorer)
 */

export enum ResultType {
  body = 1,
  interface,
  codeSnippet
}

export enum RequestTab {
  body = 1,
  headers
}

export enum Methods {
  GET = 1,
  POST,
  PUT,
  PATCH,
  DELETE,
  HEAD
}

export interface IStoredQuery {
  requestType: Methods | string;
  apiUrl: string;
  reqBody: string;
  customHeaders: IHeader[];
}

export interface IRestTesterState extends IStoredQuery {
  data: any;
  status: number | string;
  loading: boolean;
  cached: boolean;
  storage: boolean;
  storedQueries: IDropdownOption[];
  selectedStoredQuery: number | string;
  resultType: ResultType;
  wrapCode: boolean;
  requestTab: RequestTab;
  requestInfo: IRequestInfo;
  showSuggestions: boolean;
}

export interface IHeader {
  key: string;
  value: string;
}

export interface IRequestInfo {
  url: string;
  method: string;
  headers: HeadersInit;
  body: string;
}

export default class RestTester extends React.Component<IRestTesterProps, IRestTesterState> {
  private _allQueries: IStoredQuery[] = [];

  constructor(props: IRestTesterProps) {
    super(props);

    // Set the all query empty array
    this._allQueries = [];

    // Initialize state
    this.state = {
      requestType: Methods.GET,
      apiUrl: `${this.props.context.pageContext.web.absoluteUrl}/_api/web`,
      reqBody: "{}",
      data: "",
      status: null,
      loading: false,
      cached: false,
      storage: typeof localStorage !== "undefined",
      storedQueries: [],
      selectedStoredQuery: null,
      resultType: ResultType.body,
      wrapCode: false,
      customHeaders: [{ key: "", value: "" }],
      requestTab: RequestTab.body,
      requestInfo: null,
      showSuggestions: false
    };
  }

  /**
   * Default React componentDidMount method
   */
  public componentDidMount(): void {
    // Fetch previous query from local storage
    this._fetchFromStorage();
  }

  /**
   * Default React componentDidUpdate method
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: IRestTesterProps, prevState: IRestTesterState): void {
    if (this.state.cached) {
      this._runQuery();
    }
  }

  /**
   * Event handler for request mode change
   */
  private _requestChanged = (val: IDropdownOption) => {
    this.setState({
      requestType: val.key as number,
      reqBody: "{}"
    });
  }

  /**
   * Event handler for api URL change
   */
  private _apiUrlChanged = (val: string) => {
    this.setState({
      apiUrl: val
    });
  }

  /**
   * Request body value changed
   */
  private _reqBodyChanged = (val: string) => {
    this.setState({
      reqBody: val
    });
  }

  /**
   * Store the latest query in local storage
   */
  private _storeLastQuery = () => {
    if (this.state.storage) {
      const toStore: IStoredQuery = {
        requestType: Methods[this.state.requestType],
        apiUrl: this.state.apiUrl,
        reqBody: this.state.reqBody,
        customHeaders: this.state.customHeaders
      };

      localStorage.setItem(`resttester-apiUrl-${this.props.context.manifest.id}`, JSON.stringify(toStore));
    }
  }

  /**
   * Fetch the query from the browser storage
   */
  private _fetchFromStorage = () => {
    if (this.state.storage) {
      // Fetch the last stored query
      const storedQuery: string = localStorage.getItem(`resttester-apiUrl-${this.props.context.manifest.id}`);
      if (storedQuery) {
        const parsedQuery: IStoredQuery = JSON.parse(storedQuery);

        this.setState({
          requestType: typeof parsedQuery.requestType === "string" ? Methods[parsedQuery.requestType] : parsedQuery.requestType,
          apiUrl: parsedQuery.apiUrl,
          reqBody: parsedQuery.reqBody,
          customHeaders: parsedQuery.customHeaders ? parsedQuery.customHeaders : [{ key: "", value: "" }],
          cached: true
        });
      }

      // Fetch all the stored queries
      const storedQueries: string = localStorage.getItem(`resttester-allqueries-${this.props.context.manifest.id}`);
      if (storedQueries) {
        this._allQueries = JSON.parse(storedQueries);
        this._updateQueriesDropdown();
      }
    } else {
      // Run the query because browser doesn't support local storage
      this._runQuery();
    }
  }

  /**
   * Store the current query
   */
  private _saveCurrentQuery = () => {
    if (this.state.storage) {
      // Get all stored queries
      const storedQueries: string = localStorage.getItem(`resttester-allqueries-${this.props.context.manifest.id}`);
      if (!storedQueries) {
        this._allQueries = [];
      } else {
        this._allQueries = JSON.parse(storedQueries);
      }

      // Add the current query to the list
      this._allQueries.push({
        requestType: Methods[this.state.requestType],
        apiUrl: this.state.apiUrl,
        reqBody: this.state.reqBody,
        customHeaders: this.state.customHeaders
      });

      // Update the stored queries dropdown with the new values
      this._updateQueriesDropdown();

      // Update local storage
      localStorage.setItem(`resttester-allqueries-${this.props.context.manifest.id}`, JSON.stringify(this._allQueries));
    }
  }

  /**
   * Update the current selected query
   */
  private _useSelectedQuery = (val: IDropdownOption) => {
    // Check if one of the known values got selected
    if (typeof val.key === "number" && this._allQueries) {
      const newQuery = this._allQueries[val.key];
      this.setState({
        selectedStoredQuery: val.key,
        requestType: typeof newQuery.requestType === "string" ? Methods[newQuery.requestType] : newQuery.requestType,
        apiUrl: newQuery.apiUrl,
        reqBody: newQuery.reqBody,
        customHeaders: newQuery.customHeaders ? newQuery.customHeaders : [{ key: "", value: "" }]
      });
    } else {
      this.setState({
        selectedStoredQuery: val.key as number
      });
    }
  }

  /**
   * Delete the currently selected query
   */
  private _deleteCrntQuery = () => {
    if (typeof this.state.selectedStoredQuery === "number") {
      // Remove the stored query
      this._allQueries.splice(this.state.selectedStoredQuery, 1);
      // Update the values in the storage
      localStorage.setItem(`resttester-allqueries-${this.props.context.manifest.id}`, JSON.stringify(this._allQueries));
      // Get the new available queries
      this._updateQueriesDropdown();
      // Update the component state
      this.setState({
        selectedStoredQuery: null
      });
    }
  }

  /**
   * Update the elements in the stored queries dropdown
   */
  private _updateQueriesDropdown = () => {
    let ddOpts: IDropdownOption[] = this._allQueries.map((q: IStoredQuery, index: number) => ({
      key: index,
      text: `${q.requestType}: ${q.apiUrl}`
    }));

    this.setState({
      storedQueries: ddOpts
    });
  }

  /**
   * Update the tokens in the body and URL
   */
  private _updateTokens = (val: string) => {
    val = val.replace(/{webUrl}/g, this.props.context.pageContext.web.absoluteUrl);
    val = val.replace(/{webId}/g, this.props.context.pageContext.web.id.toString());
    val = val.replace(/{listId}/g, this.props.context.pageContext.list.id.toString());
    val = val.replace(/{itemId}/g, this.props.context.pageContext.listItem.id.toString());
    val = val.replace(/{siteId}/g, this.props.context.pageContext.site.id.toString());
    return val;
  }

  /**
   * Runs the specified query against SharePoint
   */
  private _runQuery = () => {
    this.setState({
      loading: true,
      data: "",
      status: null,
      cached: false
    });

    // Hiding the suggestions
    this._hideSuggestions();

    // Get state properties
    let { apiUrl, requestType, reqBody, customHeaders } = this.state;

    // Store the performed query
    this._storeLastQuery();

    // Add the current request method
    let reqOptions: ISPHttpClientOptions = {
      method: Methods[requestType]
    };

    // Check if a body needs to be added to the request
    if (requestType !== Methods.GET && requestType !== Methods.HEAD && reqBody) {
      reqBody = this._updateTokens(reqBody);
      reqOptions["body"] = reqBody;
    }

    // Create new headers object
    const reqHeaders: HeadersInit = {};

    // Check the search API is used
    if (apiUrl.toLowerCase().indexOf('_api/search') !== -1) {
      reqHeaders["odata-version"] = "3.0";
    }

    // Set all custom headers
    if (customHeaders.length > 1) {
      // Add all custom set headers
      for (const header of customHeaders) {
        if (header.key) {
          reqHeaders[header.key] = header.value;
        }
      }
    }

    // Add all headers to the options object
    reqOptions["headers"] = reqHeaders;

    // Update tokens in the URL
    apiUrl = this._updateTokens(apiUrl);

    try {
      this.props.context.spHttpClient.fetch(apiUrl, SPHttpClient.configurations.v1, reqOptions)
      .then((data: SPHttpClientResponse) => {
        this.setState({
          status: data.status
        });
        return data.json();
      })
      .then((data: any) => {
        this.setState({
          data: data,
          loading: false,
          requestInfo: {
            url: this.state.apiUrl,
            method: reqOptions.method,
            headers: reqOptions.headers,
            body: this.state.reqBody
          }
        });
      }).catch(err => {
        this.setState({
          data: err,
          loading: false,
          status: "Error",
          requestInfo: null
        });
      });
    } catch (err) {
      this.setState({
        data: err && err.message && err.stack ? { msg: err.message, stack: err.stack } : "Something went wrong, you might find a clue in the browser console.",
        loading: false,
        status: "Error"
      });
    }
  }

  /**
   * Switch the request tab
   */
  private _switchRequestTab = (val: RequestTab): void => {
    this.setState({
      requestTab: val
    });
  }

  /**
   * Switch the result tab
   */
  private _switchResultTab = (val: ResultType): void => {
    this.setState({
      resultType: val
    });
  }

  /**
   * Trigger code wrapping
   */
  private _triggerCodeWrapping = (ev: React.FormEvent<HTMLElement>, isChecked: boolean): void => {
    this.setState({
      wrapCode: isChecked
    });
  }

  /**
   * Trigger an header update
   */
  private _updateHeader = (i: number, key: string, value: string): void => {
    const allHeaders = [...this.state.customHeaders];

    // Check if key and value contain data
    if (!key && !value) {
      // Remove item
      allHeaders.splice(i, 1);

      // Check if a new item needs to be added
      if (allHeaders.length === 0) {
        // Add an new empty item
        allHeaders.push({ key: "", value: "" });
      }
    } else {
      // Update the current item
      allHeaders[i].key = key;
      allHeaders[i].value = value;

      // Check if the last item is still empty, otherwise we need to add a new header
      const lastItem = allHeaders[allHeaders.length-1];
      if (lastItem.key) {
        // Add an new empty item
        allHeaders.push({ key: "", value: "" });
      }
    }

    this.setState({
      customHeaders: allHeaders
    });
  }

  /**
   * Update the API URL from the suggestion
   */
  private _updateApiUrl = (apiUrl: string) => {
    this.setState({
      apiUrl
    });
    // Hiding the suggestions
    this._hideSuggestions();
  }

  /**
   * Trigger the suggestions to show
   */
  private _showSuggestions = () => {
    this.setState({
      showSuggestions: true
    });
  }

  /**
   * Trigger the suggestions to hide
   */
  private _hideSuggestions = () => {
    this.setState({
      showSuggestions: false
    });
  }

  /**
   * Default React render mothod
   */
  public render(): React.ReactElement<IRestTesterProps> {
    return (
      <div className={ styles.restTester }>
        <span className={ styles.title }>API tester <a className={styles.credits} href="javascript:;" onClick={() => this.props.context.propertyPane.open()} title="Elio Struyf">Created by Elio Struyf</a></span>

        {
          this.state.storage && (
            <div className={styles.row}>
              <div className={styles.col12}>
                <p className={ styles.storedTitle }>Use one of your stored API calls</p>
              </div>
              <div className={styles.col10}>
                <Dropdown selectedKey={this.state.selectedStoredQuery}
                          onChanged={this._useSelectedQuery}
                          placeHolder="Select one of your stored queries"
                          options={[
                            { key: 'EMPTY', text: '' },
                            ...this.state.storedQueries
                          ]} />
              </div>
              <div className={`${styles.col2} ${styles.deleteQuery}`}>
                <DefaultButton onClick={this._deleteCrntQuery} disabled={!this.state.storage}>
                  <Icon className={styles.icon} iconName="Delete" /> Delete query
                </DefaultButton>
              </div>
            </div>
          )
        }

        <p className={ styles.queryTitle }>Modify your API call</p>

        <p className={ styles.description }>{`The following tokens can be used in the URL and body fields: {siteId} | {webId} | {webUrl} | {listId} | {itemId}`}</p>

        <div className={styles.row}>
          <div className={styles.col1}>
            <Dropdown selectedKey={this.state.requestType}
                      onChanged={this._requestChanged}
                      className={styles.methodSelector}
                      options={[
                        { key: Methods.GET, text: 'GET' },
                        { key: Methods.POST, text: 'POST' },
                        { key: Methods.PUT, text: 'PUT' },
                        { key: Methods.PATCH, text: 'PATCH' },
                        { key: Methods.DELETE, text: 'DELETE' },
                        { key: Methods.HEAD, text: 'HEAD' }
                      ]} />
          </div>
          <div className={`${styles.col11} ${styles.queryInput}`}>
            <TextField placeholder="Specify your SharePoint API URL"
                       value={this.state.apiUrl}
                       onChanged={this._apiUrlChanged}
                       onKeyUp={(e: React.KeyboardEvent<any>) => e.key === "Enter" && this._runQuery()}
                       onFocus={this._showSuggestions}
                       onBlur={() => setTimeout(() => this._hideSuggestions(), 100)} />

            {
              this.state.showSuggestions && (
                <ApiSuggestions inputVal={this.state.apiUrl}
                                method={Methods[this.state.requestType]}
                                fChangeApiUrl={this._updateApiUrl} />
              )
            }
          </div>
        </div>

        <div className={styles.tabs}>
          <ActionButton onClick={() => this._switchRequestTab(RequestTab.body)} className={`${this.state.requestTab === RequestTab.body && styles.selectedTab}`}>
            Request body
          </ActionButton>

          <ActionButton onClick={() => this._switchRequestTab(RequestTab.headers)} className={`${this.state.requestTab === RequestTab.headers && styles.selectedTab}`}>
            Request headers { this.state.customHeaders.length > 1 && `(${this.state.customHeaders.length - 1})` }
          </ActionButton>
        </div>

        {
          this.state.requestTab === RequestTab.body ? (
            this.state.requestType !== Methods.GET && this.state.requestType !== Methods.HEAD ? (
              <AceEditor mode="json"
                        theme="github"
                        className={styles.codeZone}
                        value={this.state.reqBody}
                        onChange={this._reqBodyChanged}
                        editorProps={{ $blockScrolling: true }}
                        setOptions={{
                          showPrintMargin: false
                        }}
                        height="150px"
                        width="100%" />
            ) : (
              <MessageBar className={styles.messageBar} messageBarType={MessageBarType.info}>
                Body not supported with GET/HEAD requests
              </MessageBar>
            )
          ) : (
            <div>
              {
                this.state.customHeaders.map((ch: IHeader, index: number) => (
                  <HeadersInput hIndex={index} hKey={ch.key} hValue={ch.value} fUpdate={this._updateHeader} />
                ))
              }
            </div>
          )
        }

        <DefaultButton onClick={this._saveCurrentQuery} disabled={!this.state.storage}>
          <Icon className={styles.icon} iconName="Save" /> Store query
        </DefaultButton>

        <DefaultButton primary={ true }
                       onClick={this._runQuery}>
          <Icon className={styles.icon} iconName="LightningBolt" /> Run query
        </DefaultButton>

        {
          this.state.loading && <Spinner className={styles.spinner} size={SpinnerSize.medium} />
        }

        {
          /**
           * Result information
           */
        }
        <ResponseInfo status={this.state.status}
                      requestInfo={this.state.requestInfo}
                      resultType={this.state.resultType}
                      wrapCode={this.state.wrapCode}
                      data={this.state.data}
                      fSwitchTab={this._switchResultTab}
                      fTriggerCodeWrap={this._triggerCodeWrapping} />
      </div>
    );
  }
}
