export interface IHeadersInputProps {
  hIndex: number;
  hKey: string;
  hValue: string;

  fUpdate: (i: number, key: string, value: string) => void;
}
