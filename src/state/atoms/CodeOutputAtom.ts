import { atom } from "jotai";
import { JSX } from "react";

export const CodeOutputAtom = atom<JSX.Element | null>(null);
