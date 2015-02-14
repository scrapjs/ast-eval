/**
 * Eval string methods
 *
 * @module ast-eval/math
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var parse = require('esprima').parse;
var u = require('./util');
var uneval = require('tosource');


function evalString(ast){
	types.visit(ast, {
		visitCallExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//FIXME: generalize grasping call expressions: static methods, .apply etc

			//simple array method call
			if (
				n.MemberExpression.check(node.callee) &&
				u.isString(u.getMemberExpressionSource(node.callee))
			) {
				//method, accepting simple arguments
				if (
					(u.getCallName(node) in String.prototype) &&
					u.getCallArguments(node).every(function(node){
						return u.isSimple(node) || u.isIsolated(node);
					})
				) {
					//eval string, return recreated evaled value
					return parse(uneval(eval(gen(node)))).body[0].expression;
				}
			}
		}
	});

	return ast;
}


module.exports = evalString;