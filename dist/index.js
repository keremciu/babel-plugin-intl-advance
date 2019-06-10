"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = () => {
  return {
    name: "intl-advance",
    visitor: {
      Identifier(path) {
        path.node.name = path.node.name.split("").reverse().join("");
      }

    }
  };
};

exports.default = _default;