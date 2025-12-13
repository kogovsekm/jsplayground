import { atom } from "jotai";
import { CodeStatus } from "../../types/Status/CodeStatusTypes";

export const CodeStatusValueAtom = atom<CodeStatus>("success");
