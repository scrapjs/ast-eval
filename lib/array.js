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


//FIXME: generalize to evaluable global methods

function evalArray(ast){
	types.visit(ast, {
		visitCallExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//FIXME: generalize grasping call expressions: static methods, .apply etc

			//simple array method call
			if (n.MemberExpression.check(node.callee) &&
				n.ArrayExpression.check(u.getMemberExpressionSource(node.callee)) &&
				u.isSimple(u.getMemberExpressionSource(node.callee))
			) {
				//method, accepting simple arguments
				if (
					(u.getCallName(node) in Array.prototype) &&
					u.getCallArguments(node).every(function(node){
						return u.isSimple(node) || u.isIsolated(node);
					})
				) {
					//eval array, return recreated evaled value
					return u.evalNode(node);
				}
			}
		}
	});

	return ast;
}


module.exports = evalArray;