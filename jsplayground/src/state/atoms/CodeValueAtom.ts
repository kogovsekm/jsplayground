import { atom } from "recoil";

/**
 * @description This atom stores the value of the code editor.
 *
 * The line breaks in default are intentional, so that the code editor will display at least some surface area. There is no option to do this
 * on the editor via props.
 */
export const CodeValueAtom = atom({
  key: "CodeValueAtom",
  default: `
  
  
  
  `,
});
