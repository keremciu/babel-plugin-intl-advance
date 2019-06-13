# babel-plugin-intl-advance

This plugin automates the process of creating locale files to provide them to react-intl.

## The problem

If you add a new translation, you need to add a new key into translation file. It's a time-losing process also it's not safe for key duplication.

## This solution

Plugin automatically read your JavaScript files and extract translation keys from your `intl.formatMessage` function calls then put extracted keys into locale files without any conflict.

This plugin doesn't handle description and defaultMessage keys inside your translation object. This plugin only handles your "id" prop of your translation object.

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
    "locales": ["en-GB", "de-DE"],
    "outFile": "locales/"
  } ]
}
```

**Mandatory parameters:**

```
  locales: ["en-GB", "de-DE"]
  outDir: "locales/"
```

**Optional parameters:**

```
  intlPropName: intl,
	formattedKeys: [
		"formatMessage",
		"formatHTMLMessage"
	];
```

## Process

1. Add translation
	- You need to run this code somewhere inside your codebase. `intl.formatMessage({ id: "test" })`
	- Babel plugin will compile it in runtime and add the translation key to every language. `{ ..., "test": "" }`

2. Update translation
	- You just need to update your translation file.

3. Delete translation
	- If you delete translation from your code, it will gonna delete from your translation file.

## Example

> Your React implementation

```js
import React from "react"
import { injectIntl } from "react-intl"

const Component = ({ intl }) => (
	<div>
		{intl.formatMessage({
			id: "welcome",
		})}
	</div>
)

export default injectIntl(Component)
```

or 

```js
import React from "react"
import { useIntl } from "react-intl"

const Component = () => {
	const intl = useIntl()
	return (
		<div>
			{intl.formatMessage({
				id: "welcome",
			})}
		</div>
	)
}

export default Component
```

> What babel plugin creates in runtime

en-GB.json
```json
{
  "welcome": ""
}
```

de-DE.json
```json
{
  "welcome": ""
}
```

## LICENSE

Most of the code of this plugin is copied from [babel-plugin-react-intl](https://github.com/formatjs/formatjs/blob/master/packages/babel-plugin-react-intl/)

You can see their software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file](https://github.com/formatjs/formatjs/blob/master/LICENSE.md) for license text and copyright information.

They're using BSD clause that's why I put their license for this plugin.