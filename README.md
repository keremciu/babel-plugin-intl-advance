# babel-plugin-intl-advance

This plugin automates the process of creating locale files to provide them to react-intl.

## The problem

If you add a new translation, you need to add a new key into translation file. It's a time-losing process also it's not safe for key duplication.

## This solution

Plugin automatically read your JavaScript files and extract messages from your `intl.formatMessage` function calls then put extracted messages into locale files without any conflict.

> Note: If you use components like `<FormattedMessage>` provided by react-intl, this plugin doesn't work you. This plugin only get function calls like `intl.formatMessage()`. You need use this function call while using `injectIntl` and `useIntl`.

## Installation

```
  npm install --save-dev babel-plugin-intl-advance
```

or

```
  yarn add --D babel-plugin-intl-advance
```


## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": [ "intl-advance", {
    "defaultLocale": "en-GB",
    "locales": ["en-GB", "de-DE", "fr-FR"],
    "outFile": "locales/"
  } ]
}
```

**Mandatory parameters:**

```
  defaultLocale: "en",
  locales: ["en", "de"]
  outDir: "locales/"
```

**Optional parameters:**

```
  intlPropName: intl
```


## LICENSE

MIT