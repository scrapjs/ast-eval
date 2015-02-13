/**
 * Pre-evaluate array expressions in AST:
 * `[1,2,3].map(function(x){return x*2})`
 * `[1,2,3].join(' ')`
 * etc.
 *
 * @module ast-eval/array
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var parse = require('esprima').parse;
var u = require('./util');
var uneval = require('tosource');


function evalArray(ast){
	types.visit(ast, {
		visitCallExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//FIXME: generalize grasping call expressions: static methods, .apply etc

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