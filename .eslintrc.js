module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "jest": true
  },
  "extends": "airbnb",
  "installedESLint": true,
  "parser": 'babel-eslint',
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ],
  "rules": {
    "comma-dangle": 0,
    "no-plusplus": 0,
    "jsx-a11y/label-has-for": 0
  }
};
