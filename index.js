/**
 * Eval expressions in AST.
 *
 * @module ast-eval
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var parse = require('esprima').parse;

function astEval(ast){
	types.visit(ast, {
		visitLogicalExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//can cast nested object even with custom .valueOf or inner variables
			if ((isObject(node.left) || isSimple(node.left)) &&
				(isObject(node.right) || isSimple(node.left))
			) {
				return b.literal(eval(gen(node)));
			}
		},


		visitBinaryExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//calls .valueOf or .toString on objects
			//so pass only literals && simple objects
			if (isSimple(node.left) &&
				isSimple(node.right)
			) {
				return b.literal(eval(gen(node)));
			}
		},


		visitCallExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//simple array method call
			if (n.MemberExpression.check(node.callee) &&
				n.ArrayExpression.check(node.callee.object) &&
				isSimple(node.callee.object)
			) {
				var method;

				//method, accepting fn
				if (method = [
						'every',
						'map',
						'filter',
						'find',
						'findIndex',
						'reduce',
						'reduceRight',
						'some',
						'sort'
					].indexOf(node.callee.property.name) >= 0 &&
					node.arguments.every(isSimple)
				) {

				}

				//method, accepting simple arguments
				if (method = [
						'copyWithin',
						'includes',
						'indexOf',
						'join',
						'lastIndexOf',
						'concat',
						'push',
						'pop',
						'reverse',
						'shift',
						'slice',
						'splice',
						'toSource',
						'toString',
						'unshift'
					].indexOf(node.callee.property.name >= 0) &&
					node.arguments.every(isSimple)
				) {
					//eval array, return recreated evaled value
					return parse(JSON.stringify(eval(gen(node)))).body[0].expression;
				}
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


/** Checks whether function doesn’t use external variables */
function isIsolated(node){

}


module.exports = astEval;