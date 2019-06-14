import p from 'path'
import {writeFileSync} from 'fs'
import {sync as mkdirpSync} from 'mkdirp'

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
        t.isIdentifier(object) &&
        object.node.name === propName &&
        t.isIdentifier(property) &&
        formatMessageKeys.includes(property.node.name)
      ) {
        return true
      }
    }
    return false
  }

  const storeTranslationKey = (id, path, state) => {
    const {file, opts} = state
    const messages = file.get(MESSAGES)
    let loc
    if (opts.extractSourceLocation) {
      loc = {
        file: p.relative(process.cwd(), file.opts.filename),
        ...path.node.loc,
      }
    }

    messages.set(id, {id, ...loc})
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

      const basename = p.basename(filename, p.extname(filename))
      const messages = file.get(MESSAGES)
      const descriptors = [...messages.values()]
      file.metadata['react-intl'] = {messages: descriptors}

      if (opts.messagesDir && descriptors.length > 0) {
        // Make sure the relative path is "absolute" before
        // joining it with the `messagesDir`.
        const relativePath = p.join(p.sep, p.relative(process.cwd(), filename))

        const messagesFilename = p.join(
          opts.messagesDir,
          p.dirname(relativePath),
          `${basename}.json`,
        )

        const messagesFile = JSON.stringify(descriptors, null, 2)

        mkdirpSync(p.dirname(messagesFilename))
        writeFileSync(messagesFilename, messagesFile)
      }
    },
    visitor: {
      CallExpression(path, state) {
        const {opts} = state
        const processTranslationKey = translationObject => {
          if (wasExtracted(translationObject)) {
            return
          }

          const properties = translationObject.get('properties')
          const idProperty = properties.find(prop => {
            const key = prop.get('key')
            if (key.isIdentifier()) {
              return key.node.name === 'id'
            }
            return false
          })

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
