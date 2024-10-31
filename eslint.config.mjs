import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  { extends: ['@rushstack/eslint-config/profile/web-app'] },
  {
    rules: {
      // 파일에서 React 컴포넌트만을 export하도록 제한함으로써, Fast Refresh가 올바르게 작동할 수 있도록 돕습니다.
      'react-refresh/only-export-components': 'off',
    },
  },
]
