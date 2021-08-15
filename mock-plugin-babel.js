var path = require("path");
const invoke = require("./src/mock/invoke.js");

// const invoke = `function invoke(){
//   console.log(2)
// }`;
const code = `
function invoke(){
  console.log(1)
}
weixinJSBridge = { invoke }
weixinJSBridge.invoke()
`;

const whiteList = ["weixinjsbridge", "wx", "jsapi", "jsbridge"];

function mockjs(babel) {
  const { types: t } = babel;
  const visitor = {
    ExpressionStatement(path) {
      const nodes = path.node;

      for (let node in nodes) {
        ast = nodes[node];
        console.log("node", ast);
        if (
          ast &&
          ast.left &&
          ast.left.object &&
          ast.left.property &&
          ast.left.object.name === "window" &&
          ast.left.property.name === "weixinJSBridge" &&
          ast.right.properties
        ) {
          const properties = ast.right.properties;
          const args = properties.forEach(property => {
            if (property && property.key && property.key.name === "invoke") {
              property.value = t.functionExpression(
                null,
                [],
                t.blockStatement([
                  t.returnStatement(
                    t.callExpression(t.identifier(`${invoke}`), [])
                  )
                ])
              );
            }
          });
        }
      }
    }
  };
  return { visitor };
}

module.exports = mockjs;
