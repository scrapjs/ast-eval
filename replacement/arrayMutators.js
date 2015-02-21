/**
 * Array mutators
 */
var u = require('../util');
var types = require('ast-types');
var n = types.namedTypes;
var r = require('./');


/**
 * List of non-evaling array methods
 */
var mutators = [
	'concat',
	'includes',
	'indexOf',
	'join',
	'lastIndexOf',
	'pop',
	'push',
	'reverse',
	'shift',
	'slice',
	'splice',
	'toSource',
	'toString',
	'unshift'
];


module.exports = {
	match: 'CallExpression',

	test: function (node) {
		//simple array method call, like [1,2,3].map(...);
		if (n.MemberExpression.check(node.callee) &&
			(
				n.ArrayExpression.check(u.getMemberExpressionSource(node.callee)) ||
				u.isString(u.getMemberExpressionSource(node.callee))
			) &&
			r.test(u.getMemberExpressionSource(node.callee))
		) {
			//method, accepting simple arguments
			var callName = u.getCallName(node);
			var isSafe = mutators.indexOf(callName) >= 0;
			if (
				(
					(callName in Array.prototype) ||
					(callName in String.prototype)
				) &&
				u.getCallArguments(node).every(function (node) {
					//harmless methods (non-callable) may accept any functions
					if (n.FunctionExpression.check(node) && isSafe) return true;

					//else - check that all arguments are known
					return r.test(node);
				})
			) {
				return true;
			}
		}

		//check that both callee is callable and all arguments are ok
		return r.test(node.callee) && node.arguments.every(r.test);
	},

	//specific evaluator - keep NewExpressions unevaled
	eval: function (node) {
		//TODO
		return u.evalNode(node);
	}
};