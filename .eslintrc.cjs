/** @type {import("eslint").Linter.Config} */
const config = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: true,
    },
    settings: {
        react: {
            version: "detect",
        },
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "plugin:@next/next/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier",
    ],
    rules: {
        // These opinionated rules are enabled in stylistic-type-checked above.
        // Feel free to reconfigure them to your own preference.
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-misused-promises": [
            "error",
            {
                checksVoidReturn: { attributes: false },
            },
        ],
        quotes: [2, "double", { allowTemplateLiterals: true, avoidEscape: true }],
        "react/react-in-jsx-scope": "off",
        "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
        "react/no-unescaped-entities": "off",
        "react/prop-types": "off",
    },
};

module.exports = config;
