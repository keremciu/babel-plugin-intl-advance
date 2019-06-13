const EXTRACTED = Symbol('ReactIntlExtracted')
const MESSAGES = Symbol('ReactIntlMessages')

export default ({types: t}) => {
  const wasExtracted = path => {
    return !!path.node[EXTRACTED]
  }

  const tagAsExtracted = path => {
    path.node[EXTRACTED] = true
  }

  const evaluatePath = path => {
    const evaluated = path.evaluate()
    if (evaluated.confident) {
      return evaluated.value
    }

    throw path.buildCodeFrameError(
      '[React Intl] Messages must be statically evaluate-able for extraction.',
    )
  }

  const isFormatMessageCall = (path, opts) => {
    const propName = opts.intlPropName || 'intl'
    const formatMessageKeys = opts.formatMessageKeys || [
      'formatMessage',
      'formatHTMLMessage',
    ]
    if (t.isMemberExpression(path)) {
      const object = path.get('object')
      const property = path.get('property')
      if (
        t.isIdentifier(object, {name: propName}) &&
        t.isIdentifier(property) &&
        formatMessageKeys.includes(property.node.name)
      ) {
        return true
      }
    }
    return false
  }

  return {
    name: 'intl-advance',
    pre(file) {
      if (!file.has(MESSAGES)) {
        file.set(MESSAGES, new Map())
      }
    },
    post(file) {
      const {opts} = this
      const {filename} = file.opts
      // __source={ { fileName: 'this/file.js', lineNumber: 10 } }
    },
    visitor: {
      CallExpression(path, state) {
        const {opts} = state
        const processTranslationKey = translationObject => {
          if (wasExtracted(translationObject)) {
            return
          }

          const properties = translationObject.get('properties')
          const idProperty = properties.find(p => p.get('key').name === 'id')
          const idValue = evaluatePath(idProperty.get('value')).trim()
          storeTranslationKey(idValue, translationObject, state)

          // Tag the AST node so we don't try to extract it twice.
          tagAsExtracted(translationObject)
        }
        if (isFormatMessageCall(path.get('callee'), opts)) {
          const [firstArgument] = path.get('arguments')
          if (firstArgument.type === 'ObjectExpression') {
            processTranslationKey(firstArgument)
          }
        }
      },
    },
  }
}
