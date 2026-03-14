const js = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefreshModule = require("eslint-plugin-react-refresh");

const reactRefresh = reactRefreshModule.default ?? reactRefreshModule;

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
    },
  },
  {
    files: [
      "src/components/code-output-viewer/CodeOutputViewer.tsx",
      "src/components/console-output-viewer/scripts/ConsoleOutputViewer.tsx",
    ],
    rules: {
      "react-hooks/unsupported-syntax": "off",
    },
  },
];
