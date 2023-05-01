import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Paper,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useCallback, useMemo } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { AlertCircle, InfoCircle, Check } from "tabler-icons-react";
import "./App.css";
import CodeEditor from "./components/code-editor/CodeEditor";
import CodeOutputViewer from "./components/code-output-viewer/CodeOutputViewer";
import ResizeHandle from "./components/resize-handle/ResizeHandle";
import { CodeErrorValueAtom } from "./state/atoms/CodeErrorValueAtom";
import { CodeSanitizationSelector } from "./state/selectors/CodeSanitizationSelector";
import { CodeStatusSelector } from "./state/selectors/CodeStatusSelector";
import {
  clearLocalStorage,
  getCodeFromLocalStorage,
} from "./helpers/local-storage.helpers";
import { notifications } from "@mantine/notifications";
import { CodeValueAtom } from "./state/atoms/CodeValueAtom";

const App: React.FC = () => {
  const setCodeToEditor = useSetRecoilState(CodeValueAtom);
  const sanitizedCode = useRecoilValue(CodeSanitizationSelector);
  const error = useRecoilValue(CodeErrorValueAtom);
  const status = useRecoilValue(CodeStatusSelector);

  const debouncedCodeValue = useDebouncedValue(sanitizedCode, 1000);

  const applyCodeFromLocalStorage = useCallback(() => {
    const code = getCodeFromLocalStorage();

    if (!code) {
      notifications.show({
        title: "No code found",
        message: "No code was found in local storage.",
        withBorder: true,
        icon: <AlertCircle size="1.1rem" />,
        color: "red",
      });
    } else {
      setCodeToEditor(code);
      notifications.show({
        title: "Code loaded",
        message: "Your code has been loaded from local storage.",
        withBorder: true,
        icon: <Check size="1.1rem" />,
        color: "teal",
      });
    }
  }, [setCodeToEditor]);

  const saveCodeToLocalStorage = useCallback(() => {
    localStorage.setItem("code", sanitizedCode);

    notifications.show({
      title: "Code saved",
      message: "Your code has been saved to local storage.",
      withBorder: true,
      icon: <Check size="1.1rem" />,
      color: "teal",
    });
  }, [sanitizedCode]);

  const clearStorage = useCallback(() => {
    clearLocalStorage();

    notifications.show({
      title: "Local storage cleared",
      message: "Your code has been cleared from local storage.",
      withBorder: true,
      icon: <Check size="1.1rem" />,
      color: "teal",
    });
  }, []);

  const memoizedStatus = useMemo(() => {
    if (status === "error") {
      return {
        badgeColor: "red",
        badgeText: "Error",
        borderClass: "error-red-border",
      };
    } else if (status === "success") {
      return {
        badgeColor: "green",
        badgeText: "Valid code",
        borderClass: "success-green-border",
      };
    }

    return {
      badgeColor: "blue",
      badgeText: "No code",
      borderClass: "no-code-border",
    };
  }, [status]);

  return (
    <>
      <div className={"Container"}>
        <div className={"BottomRow"}>
          <PanelGroup autoSaveId="editorGroup" direction="horizontal">
            <>
              <Panel className={"Panel"} collapsible={true} order={1}>
                <div className={"PanelContent"}>
                  {/* Editor grid */}
                  <Paper w={"100%"} h={"100%"} p={2}>
                    <Grid align="center">
                      <Grid.Col span={5}>
                        <Flex align="center">
                          <Title order={4} m={8}>
                            <Text>JS playground</Text>
                          </Title>
                          <Badge color={memoizedStatus?.badgeColor}>
                            {memoizedStatus?.badgeText}
                          </Badge>
                        </Flex>
                      </Grid.Col>
                      <Grid.Col span="content" offset={3}>
                        <Button
                          size={"xs"}
                          radius={"xl"}
                          color="cyan"
                          mr={6}
                          disabled={status !== "success"}
                          onClick={saveCodeToLocalStorage}
                        >
                          Save
                        </Button>

                        <Button
                          size={"xs"}
                          radius={"xl"}
                          color="green"
                          mr={6}
                          onClick={applyCodeFromLocalStorage}
                        >
                          Apply
                        </Button>

                        <Button
                          size={"xs"}
                          radius={"xl"}
                          color="pink"
                          onClick={clearStorage}
                        >
                          Clear cache
                        </Button>
                      </Grid.Col>
                    </Grid>

                    <Divider p={4} />
                    <div>
                      <CodeEditor />
                    </div>
                  </Paper>
                </div>
              </Panel>
              <ResizeHandle />
            </>
            <>
              <Panel className={"Panel"} collapsible={true} order={2}>
                {/* Output and errors grid */}

                <PanelGroup
                  autoSaveId="outputAndErrorGroup"
                  direction="vertical"
                >
                  <>
                    <Panel className="Panel" collapsible={true} order={1}>
                      <div className="PanelContent">
                        <Paper w={"100%"} h={"100%"} p={2}>
                          <Flex align="center">
                            <Title order={4} m={8}>
                              Code output
                            </Title>
                            <Tooltip
                              label="Code output section will display contents of code that is run in the editor"
                              color="dark"
                            >
                              <ActionIcon color="cyan">
                                <InfoCircle />
                              </ActionIcon>
                            </Tooltip>
                          </Flex>

                          <Divider p={4} />
                          <div>
                            <CodeOutputViewer
                              codeValue={debouncedCodeValue[0]}
                            />
                          </div>
                        </Paper>
                      </div>
                    </Panel>
                    <ResizeHandle />
                    <Panel className="Panel" collapsible={true} order={1}>
                      <div className="PanelContent">
                        <Paper w={"100%"} h={"100%"} p={2}>
                          <Flex align="center">
                            <Title
                              order={4}
                              m={8}
                              color={error?.message ? "#ff6b6b" : "inherit"}
                            >
                              Errors
                            </Title>
                            <Tooltip
                              label="Errors section will display any errors that occur when running the code"
                              color="dark"
                            >
                              <ActionIcon color="cyan">
                                <InfoCircle />
                              </ActionIcon>
                            </Tooltip>
                          </Flex>

                          <Divider p={4} />
                          <div>
                            {error.message && (
                              <Alert
                                icon={<AlertCircle size="1rem" />}
                                title={error?.title ?? "Error"}
                                color="red"
                                variant="outline"
                              >
                                <pre>{error?.message ?? "Unknown error"}</pre>
                              </Alert>
                            )}
                          </div>
                        </Paper>
                      </div>
                    </Panel>
                  </>
                </PanelGroup>
              </Panel>
            </>
          </PanelGroup>
        </div>
      </div>
    </>
  );
};

export default App;
