export interface IApiSuggestionsProps {
  inputVal: string;
  method: string;

  fChangeApiUrl: (apiUrl: string) => void;
}
