import * as React from 'react';
import styles from './RestTester.module.scss';
// import styles from './HeadersInput.module.scss';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import { Icon } from 'office-ui-fabric-react/lib/components/Icon';

export interface IHeadersInputProps {
  hIndex: number;
  hKey: string;
  hValue: string;
  fUpdate: (i: number, key: string, value: string) => void;
}

export interface IHeadersInputState {
  hKey: string;
  hValue: string;
}

export default class HeadersInput extends React.Component<IHeadersInputProps, IHeadersInputState> {
  constructor(props: IHeadersInputProps) {
    super(props);

    this.state = {
      hKey: "",
      hValue: ""
    };
  }

  /**
   * componentDidMount lifecycle hook
   */
  public componentDidMount(): void {
    this.setState({
      hKey: this.props.hKey,
      hValue: this.props.hValue
    });
  }

  /**
   * componentWillReceiveProps lifecycle hook
   */
  public componentWillReceiveProps(nextProps: IHeadersInputProps): void {
    if (nextProps.hIndex !== this.props.hIndex ||
        nextProps.hKey !== this.props.hKey ||
        nextProps.hValue !== this.props.hValue) {
      this.setState({
        hKey: nextProps.hKey,
        hValue: nextProps.hValue
      });
    }
  }

  /**
   * Update the header key
   */
  private _updateHeaderKey = (val: string) => {
    this.setState({
      hKey: val
    });

    // Check if the parent needs to be updated
    if (val && this.state.hValue) {
      this.props.fUpdate(this.props.hIndex, val, this.state.hValue);
    }
  }

  /**
   * Update the header key
   */
  private _updateHeaderVal = (val: string) => {
    this.setState({
      hValue: val
    });

    // Check if the parent needs to be updated
    if (val && this.state.hValue) {
      this.props.fUpdate(this.props.hIndex, this.state.hKey, val);
    }
  }

  /**
   * Clear the current header
   */
  private _clearHeader = () => {
    this.setState({
      hKey: "",
      hValue: ""
    });

    this.props.fUpdate(this.props.hIndex, "", "");
  }

  public render(): React.ReactElement<IHeadersInputProps> {
    return (
      <div className={styles.row}>
        <div className={styles.col5}>
          <TextField placeholder="Header key"
                     value={this.state.hKey}
                     onChanged={this._updateHeaderKey} />
        </div>
        <div className={styles.col5}>
          <TextField placeholder="Header value"
                     value={this.state.hValue}
                     onChanged={this._updateHeaderVal} />
        </div>
        <div className={styles.col2}>
          {
            (this.state.hKey || this.state.hValue) && (
              <DefaultButton onClick={this._clearHeader}>
                <Icon className={styles.icon} iconName="Cancel" /> Clear header
              </DefaultButton>
            )
          }
        </div>
      </div>
    );
  }
}
