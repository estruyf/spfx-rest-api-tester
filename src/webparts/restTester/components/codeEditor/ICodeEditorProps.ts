export interface ICodeEditorProps {
  code: string;
  language: string;
  readOnly: boolean;
  wordWrap: boolean;
  height?: string;

  onChange?: (val: string) => void;
}
