export default () => {
  return {
    name: "intl-advance",
    visitor: {
      Identifier(path) {
        path.node.name = path.node.name
          .split("")
          .reverse()
          .join("");
      }
    }
  };
};
