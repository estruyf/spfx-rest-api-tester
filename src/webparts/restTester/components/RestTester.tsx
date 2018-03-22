import * as React from 'react';
import styles from './RestTester.module.scss';
import { IRestTesterProps } from './IRestTesterProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import * as brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';

export interface IStoredQuery {
  requestType: string;
  apiUrl: string;
  reqBody: string;
}

export interface IRestTesterState extends IStoredQuery {
  data: any;
  loading: boolean;
  cached: boolean;
  storage: boolean;
  storedQueries: IDropdownOption[];
  selectedStoredQuery: number | string;
}

export default class RestTester extends React.Component<IRestTesterProps, IRestTesterState> {
  private _allQueries: IStoredQuery[] = [];

  constructor(props: IRestTesterProps) {
    super(props);

    // Set the all query empty array
    this._allQueries = [];

    // Initialize state
    this.state = {
      requestType: "GET",
      apiUrl: `${this.props.context.pageContext.web.absoluteUrl}/_api/web`,
      reqBody: "{}",
      data: null,
      loading: false,
      cached: false,
      storage: typeof localStorage !== "undefined",
      storedQueries: [],
      selectedStoredQuery: null
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
      requestType: val.key as string,
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
        requestType: this.state.requestType,
        apiUrl: this.state.apiUrl,
        reqBody: this.state.reqBody
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
          requestType: parsedQuery.requestType,
          apiUrl: parsedQuery.apiUrl,
          reqBody: parsedQuery.reqBody,
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
        requestType: this.state.requestType,
        apiUrl: this.state.apiUrl,
        reqBody: this.state.reqBody
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
        requestType: newQuery.requestType,
        apiUrl: newQuery.apiUrl,
        reqBody: newQuery.reqBody
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
    val = val.replace(/{listId}/g, this.props.context.pageContext.list.id.toString());
    val = val.replace(/{itemId}/g, this.props.context.pageContext.listItem.id.toString());
    return val;
  }

  /**
   * Runs the specified query against SharePoint
   */
  private _runQuery = () => {
    this.setState({
      loading: true,
      data: "",
      cached: false
    });

    // Store the performed query
    this._storeLastQuery();

    let reqOptions: ISPHttpClientOptions = {
      method: this.state.requestType
    };
    if (this.state.requestType === "POST") {
      let { reqBody } = this.state;
      reqBody = this._updateTokens(reqBody);
      reqOptions["body"] = reqBody;
    }

    let { apiUrl } = this.state;

    // Update tokens in the URL
    apiUrl = this._updateTokens(apiUrl);

    this.props.context.spHttpClient.fetch(apiUrl, SPHttpClient.configurations.v1, reqOptions)
    .then((data: SPHttpClientResponse) => data.json())
    .then((data: any) => {
      this.setState({
        data: data,
        loading: false
      });
    });
  }

  /**
   * Default React render mothod
   */
  public render(): React.ReactElement<IRestTesterProps> {
    const restResponse: string = this.state.data ? JSON.stringify(this.state.data, null, 2) : "";

    return (
      <div className={ styles.restTester }>
        <p className={ styles.title }>API tester</p>

        {
          this.state.storage && (
            <div>
              <p className={ styles.storedTitle }>Use one of your stored API calls</p>
              <table>
                <tr>
                  <td className={styles.storedQueries}>
                    <Dropdown selectedKey={this.state.selectedStoredQuery}
                              onChanged={this._useSelectedQuery}
                              options={[
                                { key: 'EMPTY', text: '' },
                                ...this.state.storedQueries
                              ]} />
                  </td>
                  <td className={styles.deleteQuery}>
                    <DefaultButton onClick={this._deleteCrntQuery} disabled={!this.state.storage}>
                      <Icon className={styles.icon} iconName="Delete" /> Delete query
                    </DefaultButton>
                  </td>
                </tr>
              </table>
            </div>
          )
        }

        <p className={ styles.queryTitle }>Modify your API call</p>

        <p className={ styles.description }>{`The following tokens can be used in the URL and body fields: {webUrl} | {listId} | {itemId}`}</p>

        <table>
          <tr>
            <td className={styles.requestType}>
              <Dropdown selectedKey={this.state.requestType}
                        onChanged={this._requestChanged}
                        options={[
                          { key: 'GET', text: 'GET' },
                          { key: 'POST', text: 'POST' }
                        ]} />
            </td>
            <td className={styles.apiInput}>
              <TextField placeholder="Specify your SharePoint API URL"
                         value={this.state.apiUrl}
                         onChanged={this._apiUrlChanged} />
            </td>
          </tr>
        </table>

        {
          this.state.requestType === "POST" && (
            <div>
              <Label>Request body</Label>
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

        <p className={ styles.title }>API Result</p>

        <AceEditor mode="json"
                   theme="github"
                   className={styles.codeZone}
                   value={restResponse}
                   readOnly={true}
                   editorProps={{ $blockScrolling: true }}
                   setOptions={{
                     //  wrap: true,
                     showPrintMargin: false,
                     maxLines: restResponse ? restResponse.split(/\r\n|\r|\n/).length : 15
                   }}
                   width="100%" />
      </div>
    );
  }
}
