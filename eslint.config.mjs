import next from "eslint-config-next";

export default [
  ...next,
  {
    rules: {
      "no-unused-vars": "warn",
      quotes: ["warn", "double"],
      "prefer-const": "warn",
    },
  },
];
