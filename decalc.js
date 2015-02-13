/**
 * Decalculate object properties, if possible
 * `Math['sin'] → Math.sin`
 *
 * @module ast-eval/decalc
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var isSimple = require('./util').isSimple;
var isIsolated = require('./util').isIsolated;
var isObject = require('./util').isObject;


function evalExp(ast){
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
		}
	});

	return ast;
}


module.exports = evalExp;