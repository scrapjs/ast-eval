/**
 * Eval math expressions
 *
 * @module ast-eval/math
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var parse = require('esprima').parse;
var isSimple = require('./util').isSimple;
var isIsolated = require('./util').isIsolated;
var isObject = require('./util').isObject;


function evalArray(ast){
	types.visit(ast, {
		visitCallExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//simple array method call
			if (n.MemberExpression.check(node.callee) &&
				n.ArrayExpression.check(node.callee.object) &&
				u.isSimple(node.callee.object)
			) {
				//method, accepting simple arguments
				if (
					(node.callee.property.name in Array.prototype) &&
					node.arguments.every(function(node){
						return u.isSimple(node) || u.isIsolated(node);
					})
				) {
					//eval array, return recreated evaled value
					return parse(uneval(eval(gen(node)))).body[0].expression;
				}
			}
		}
	});

	return ast;
}


module.exports = evalArray;