import * as React from 'react';
import styles from './RestTester.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';

const knownAPIs: IKnownAPIs = require('./known-apis.json');

interface IKnownAPIs {
  api: string[];
}

export interface IApiSuggestionsProps {
  inputVal: string;

  fChangeApiUrl: (apiUrl: string) => void;
}

export interface IApiSuggestionsState {
  apiUrls: string[];
  apiBegin: string;
  apiEnd: string;
}

export default class ApiSuggestions extends React.Component<IApiSuggestionsProps, IApiSuggestionsState> {
  constructor(props: IApiSuggestionsProps) {
    super(props);

    this.state = {
      apiUrls: [],
      apiBegin: "",
      apiEnd: ""
    };
  }

  public componentDidMount(): void {
    this._filterApiUrls(this.props.inputVal);
  }

  public componentDidUpdate(prevProps: IApiSuggestionsProps, prevState: IApiSuggestionsState): void {
    if (prevProps.inputVal !== this.props.inputVal) {
      this._filterApiUrls(this.props.inputVal);
    }
  }

  private _filterApiUrls = (crntUrl: string) => {
    let apiBegin: string = "";
    let apiEnd: string = "";

    // Retrieve the required URL parts to start filtering
    if (crntUrl.indexOf("_api/") !== -1) {
      let apiSplit: string[] = crntUrl.split("_api/");
      apiBegin = apiSplit[0];
      apiEnd = `_api/${apiSplit[1]}`;
    } else if (crntUrl.indexOf("_vti_bin") !== -1) {
      let apiSplit: string[] = crntUrl.split("_vti_bin/");
      apiBegin = apiSplit[0];
      apiEnd = `_vti_bin/${apiSplit[1]}`;
    }

    // Filter the known APIs
    const apiUrls = knownAPIs.api.filter(u =>
      u.toLowerCase().indexOf(apiEnd.toLowerCase()) !== -1 && u.toLowerCase() !== apiEnd.toLowerCase()
    );

    this.setState({
      apiUrls,
      apiBegin,
      apiEnd
    });
  }

  private _useApiUrl = (url: string) => {
    this.props.fChangeApiUrl(url);
  }

  public render(): React.ReactElement<IApiSuggestionsProps> {
    if (this.props.inputVal && this.state.apiUrls.length > 0 && this.state.apiEnd) {
      return (
        <ul className={styles.suggestions}>
          {
            this.state.apiUrls.map(u => (
              <li key={escape(u)}>
                <a href="javascript:;" onClick={() => this._useApiUrl(`${this.state.apiBegin}${u}`)}>{`${this.state.apiBegin}${u}`}</a>
              </li>
            ))
          }
        </ul>
      );
    }

    return null;
  }
}
