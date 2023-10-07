import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Menu,
  Paper,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue, useViewportSize } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
} from "react-resizable-panels";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import {
  AlertCircle,
  Check,
  FileDownload,
  FileUpload,
  Menu as IconMenu,
  InfoCircle,
  Trash,
  Backspace,
} from "tabler-icons-react";
import "./App.css";
import CodeEditor from "./components/code-editor/CodeEditor";
import CodeOutputViewer from "./components/code-output-viewer/CodeOutputViewer";
import ResizeHandle from "./components/resize-handle/ResizeHandle";
import {
  clearLocalStorage,
  getCodeFromLocalStorage,
} from "./helpers/local-storage.helpers";
import { CodeErrorValueAtom } from "./state/atoms/CodeErrorValueAtom";
import { CodeValueAtom } from "./state/atoms/CodeValueAtom";
import { CodeSanitizationSelector } from "./state/selectors/CodeSanitizationSelector";
import { CodeStatusSelector } from "./state/selectors/CodeStatusSelector";

const App: React.FC = () => {
  const { width } = useViewportSize();
  const setCodeToEditor = useSetRecoilState(CodeValueAtom);
  const resetCodeValue = useResetRecoilState(CodeValueAtom);
  const sanitizedCode = useRecoilValue(CodeSanitizationSelector);
  const error = useRecoilValue(CodeErrorValueAtom);
  const status = useRecoilValue(CodeStatusSelector);

  const debouncedCodeValue = useDebouncedValue(sanitizedCode, 1000);

  const isOnMobile = useMemo(() => width < 992, [width]);

  const errorAndLogsPanelRef = useRef<ImperativePanelHandle>(null);

  /**
   * Imperatively collapse or expand the side panels based on the viewport size.
   */
  useEffect(() => {
    const sidePanels = errorAndLogsPanelRef.current;

    if (isOnMobile) {
      sidePanels?.collapse();
    } else {
      sidePanels?.expand();
    }
  }, [isOnMobile]);

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
      <Box m={"sm"}>
        <Flex justify="flex-end">
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                size="xs"
                variant="outline"
                rightIcon={<IconMenu size={14} />}
              >
                Menu
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Application</Menu.Label>
              <Menu.Item
                icon={<FileDownload size={14} color="cyan" />}
                disabled={status !== "success"}
                onClick={saveCodeToLocalStorage}
              >
                Save
              </Menu.Item>
              <Menu.Item
                icon={<Backspace size={14} />}
                onClick={resetCodeValue}
                color="blue"
              >
                Clear all code
              </Menu.Item>
              <Menu.Item
                icon={<FileUpload size={14} />}
                onClick={applyCodeFromLocalStorage}
              >
                Apply from cache
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>
              <Menu.Item
                color="red"
                icon={<Trash size={14} />}
                onClick={clearStorage}
              >
                Clear cache
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Box>
      <div className={"Container"}>
        <div className={"BottomRow"}>
          <PanelGroup autoSaveId="editorGroup" direction="horizontal">
            <>
              <Panel className={"Panel"} collapsible={true} order={1}>
                <div className={"PanelContent"}>
                  {/* Editor grid */}
                  <Paper w={"100%"} h={"100%"} p={2}>
                    <Grid align="center">
                      <Grid.Col>
                        <Flex align="center">
                          <Title order={4} m={8}>
                            <Text>JS playground</Text>
                          </Title>
                          <Badge color={memoizedStatus?.badgeColor}>
                            {memoizedStatus?.badgeText}
                          </Badge>
                        </Flex>
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
              <Panel
                className={"Panel"}
                collapsible={true}
                order={2}
                ref={errorAndLogsPanelRef}
              >
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
                              style={{
                                color: error?.message ? "#ff6b6b" : "inherit",
                              }}
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
