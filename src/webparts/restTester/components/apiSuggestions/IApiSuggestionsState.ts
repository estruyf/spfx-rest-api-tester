import { IApi } from "../IKnownApis";

export interface IApiSuggestionsState {
  apiUrls: IApi[];
  apiBegin: string;
  apiEnd: string;
}
