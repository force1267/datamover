module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  env: {
    'node': true,
    'jest': true
  },
  globals:{
    'BigInt':true
  },
  rules: {
    "strict": 0,
    "no-empty-function": "off",
    "import/no-unresolved": 0,
    "no-plusplus": "off",
    "no-await-in-loop": "off",
    "no-console": "off",
    "no-param-reassign": "off",
    "arrow-parens": "off",
    "object-curly-spacing": "off",
    "no-restricted-globals": "off",
    'max-len': ['error', { code: 120 }],
    "object-curly-newline": ["error", {
      "ObjectExpression": { "multiline": true, "minProperties": 6, "consistent": true },
      "ObjectPattern": { "multiline": true, "minProperties": 6, "consistent": true },
      "ImportDeclaration": { "multiline": true, "minProperties": 6, "consistent": true },
      "ExportDeclaration": { "multiline": true, "minProperties": 6, "consistent": true },
    }],
    "prefer-destructuring": ["error", {
      "VariableDeclarator": {
        "array": false,
        "object": true,
      },
      "AssignmentExpression": {
        "array": false,
        "object": false,
      },
    }],
    "radix": "off",
    "no-unneeded-ternary": "off",
    "no-confusing-arrow": "off",
    "no-unused-vars": ['error', {"args": "none"}],
    "default-case": "off",
    "no-mixed-operators": "off",
    "no-continue": "off",
    "prefer-const": ["error", {
      "destructuring": "all",
      "ignoreReadBeforeAssign": false
    }],
    "no-restricted-syntax": "off",
    "class-methods-use-this": "off",
    "no-return-assign": "off",
    "func-names": "off",
    "no-underscore-dangle": "off",
    "no-throw-literal": "off",
    "quote-props": "off",
    "import/no-dynamic-require": "off",
    "global-require": "off"
  },
};
