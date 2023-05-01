import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { useRecoilState } from "recoil";
import { CodeValueAtom } from "../../state/atoms/CodeValueAtom";

const CodeEditor: React.FC = () => {
  const [code, setCode] = useRecoilState(CodeValueAtom);

  return (
    <CodeMirror
      value={code}
      onChange={(value: string) => setCode(value)}
      theme="dark"
      extensions={[javascript({ jsx: true })]}
      basicSetup={{
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
        highlightActiveLine: true,
        bracketMatching: true,
        tabSize: 2,
      }}
    />
  );
};

export default CodeEditor;
