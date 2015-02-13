/**
 * Eval expressions in AST.
 *
 * @module ast-eval
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;

function astEval(ast){
	types.visit(ast, {
		visitExpression: function(path){
			//go deep first
			this.traverse(path);

			var node = path.node;

			//logical expressions
			//can cast nested object even with custom .valueOf or inner variables
			if (
				n.LogicalExpression.check(node) &&
				(isObject(node.left) || isSimple(node.left)) &&
				(isObject(node.right) || isSimple(node.left))
			) {
				return b.literal(eval(gen(node)));
			}

			//binary expressions
			//calls .valueOf or .toString on objects
			//so pass only literals && simple objects
			if (
				n.BinaryExpression.check(node) &&
				isSimple(node.left) &&
				isSimple(node.right)
			) {
				return b.literal(eval(gen(node)));
			}
		}
	});

	return ast;
}

function isObject(node){
	if (n.ArrayExpression.check(node)) return true;
	if (n.ObjectExpression.check(node)) return true;
	if (n.FunctionExpression.check(node)) return true;
	if (n.ThisExpression.check(node)) return true;
}

/** Check object contains only literals */
function isSimple(node){
	if (n.Literal.check(node)) return true;
	if (n.ArrayExpression.check(node)) return node.elements.every(isSimple);
	if (n.ObjectExpression.check(node)) return node.properties.every(function(prop){
		return isSimple(prop.value);
	});
}


module.exports = astEval;