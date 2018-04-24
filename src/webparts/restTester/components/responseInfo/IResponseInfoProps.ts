import { ResultType, IRequestInfo } from '../RestTester';

export interface IResponseInfoProps {
  status: number | string;
  resultType: ResultType;
  wrapCode: boolean;
  requestInfo: IRequestInfo;
  data: string;

  fSwitchTab: (val: ResultType) => void;
  fTriggerCodeWrap: (ev: React.FormEvent<HTMLElement>, isChecked: boolean) => void;
}
