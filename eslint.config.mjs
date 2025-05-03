import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable the rule for unused variables (you can set this to 'warn' or 'off' as needed)
      "@typescript-eslint/no-unused-vars": "off",
      // Disable the rule for the 'any' type usage
      "@typescript-eslint/no-explicit-any": "off",
      // You can add other custom rule adjustments here
      "react-hooks/rules-of-hooks": "error",
    },
  }
];

export default eslintConfig;
