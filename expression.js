/**
 * Eval simple expressions.
 * `1 + 2 + 4` → `7`
 *
 * @module  ast-eval/expression
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var isSimple = require('./util').isSimple;
var isIsolated = require('./util').isIsolated;
var isObject = require('./util').isObject;
var parse = require('esprima').parse;
var uneval = require('tosource');


function evalExp(ast){
	types.visit(ast, {
		visitExpression: function(path){
			var node = path.node;

			//can cast nested object even with custom .valueOf or inner variables
			if (
				n.LogicalExpression.check(node) &&
				(isObject(node.left) || isSimple(node.left)) &&
				(isObject(node.right) || isSimple(node.left))
			) {
				return b.literal(eval(gen(node)));
			}

			//calls .valueOf or .toString on objects
			//so pass only literals && simple objects
			if (isSimple(node)) {
				return parse(uneval(eval(gen(node)))).body[0].expression;
			}

			this.traverse(path);
		}
	});

	return ast;
}


module.exports = evalExp;