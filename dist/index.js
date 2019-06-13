"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _path = _interopRequireDefault(require("path"));

var _fs = require("fs");

var _mkdirp = require("mkdirp");

var EXTRACTED = Symbol('ReactIntlExtracted');
var MESSAGES = Symbol('ReactIntlMessages');

var _default = function _default(_ref) {
  var t = _ref.types;

  var wasExtracted = function (path) {
    return !!path.node[EXTRACTED];
  };

  var tagAsExtracted = function (path) {
    path.node[EXTRACTED] = true;
  };

  var evaluatePath = function (path) {
    var evaluated = path.evaluate();

    if (evaluated.confident) {
      return evaluated.value;
    }

    throw path.buildCodeFrameError('[React Intl] Messages must be statically evaluate-able for extraction.');
  };

  var isFormatMessageCall = function (path, opts) {
    var propName = opts.intlPropName || 'intl';
    var formatMessageKeys = opts.formatMessageKeys || ['formatMessage', 'formatHTMLMessage'];

    if (t.isMemberExpression(path)) {
      var object = path.get('object');
      var property = path.get('property');

      if (t.isIdentifier(object, {
        name: propName
      }) && t.isIdentifier(property) && formatMessageKeys.includes(property.node.name)) {
        return true;
      }
    }

    return false;
  };

  var storeTranslationKey = function (id, path, state) {
    var file = state.file,
        opts = state.opts;
    var messages = file.get(MESSAGES);
    var loc;

    if (opts.extractSourceLocation) {
      loc = (0, _extends2.default)({
        file: _path.default.relative(process.cwd(), file.opts.filename)
      }, path.node.loc);
    }

    messages.set(id, (0, _extends2.default)({
      id
    }, loc));
  };

  return {
    name: 'intl-advance',

    pre(file) {
      if (!file.has(MESSAGES)) {
        file.set(MESSAGES, new Map());
      }
    },

    post(file) {
      var opts = this.opts;
      var filename = file.opts.filename;

      var basename = _path.default.basename(filename, _path.default.extname(filename));

      var messages = file.get(MESSAGES);
      var descriptors = [].concat(messages.values());
      file.metadata['react-intl'] = {
        messages: descriptors
      };

      if (opts.messagesDir && descriptors.length > 0) {
        // Make sure the relative path is "absolute" before
        // joining it with the `messagesDir`.
        var relativePath = _path.default.join(_path.default.sep, _path.default.relative(process.cwd(), filename));

        var messagesFilename = _path.default.join(opts.messagesDir, _path.default.dirname(relativePath), `${basename}.json`);

        var messagesFile = JSON.stringify(descriptors, null, 2);
        (0, _mkdirp.sync)(_path.default.dirname(messagesFilename));
        (0, _fs.writeFileSync)(messagesFilename, messagesFile);
      } // const basename = p.basename(filename, p.extname(filename))
      // const messages = file.get(MESSAGES)
      // const descriptors = [...messages.values()]
      // file.metadata['react-intl-advanced'] = {messages: descriptors}
      // if (opts.messagesDir && descriptors.length > 0) {
      //   // Make sure the relative path is "absolute" before
      //   // joining it with the `messagesDir`.
      //   const relativePath = p.join(p.sep, p.relative(process.cwd(), filename))
      //   const messagesFilename = p.join(
      //     opts.messagesDir,
      //     p.dirname(relativePath),
      //     `${basename}.json`,
      //   )
      //   const messagesFile = JSON.stringify(descriptors, null, 2)
      //   mkdirpSync(p.dirname(messagesFilename))
      //   writeFileSync(messagesFilename, messagesFile)
      // }
      // delete or add to locale files
      // __source={ { fileName: 'this/file.js', lineNumber: 10 } }

    },

    visitor: {
      CallExpression(path, state) {
        var opts = state.opts;

        var processTranslationKey = function (translationObject) {
          if (wasExtracted(translationObject)) {
            return;
          }

          var properties = translationObject.get('properties');
          var idProperty = properties.find(function (p) {
            return p.get('key').name === 'id';
          });
          var idValue = evaluatePath(idProperty.get('value')).trim();
          storeTranslationKey(idValue, translationObject, state); // Tag the AST node so we don't try to extract it twice.

          tagAsExtracted(translationObject);
        };

        if (isFormatMessageCall(path.get('callee'), opts)) {
          var _path$get = path.get('arguments'),
              firstArgument = _path$get[0];

          if (firstArgument.type === 'ObjectExpression') {
            processTranslationKey(firstArgument);
          }
        }
      }

    }
  };
};

exports.default = _default;