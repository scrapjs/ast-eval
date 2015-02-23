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


//FIXME: generalize builtin method calling
//FIXME: treat unsafe arguments for associative objects


/** Test whether safe method is called */
function testMutatorMethod (node) {
	if (n.MemberExpression.check(node.callee) &&
		(
			n.ArrayExpression.check(u.getMemberExpressionSource(node.callee)) ||
			u.isString(u.getMemberExpressionSource(node.callee))
		) &&
		r.test(u.getMemberExpressionSource(node.callee))
	) {
		var callName = u.getCallName(node);
		//method, accepting simple arguments
		var isSafe = mutators.indexOf(callName) >= 0;
		if (isSafe &&
			(
				(callName in Array.prototype) ||
				(callName in String.prototype)
			) &&
			u.getCallArguments(node).every(function (node) {
				//harmless methods (non-callable) may accept any functions
				//as far they’re evaled unchanged
				if (n.FunctionExpression.check(node)) return true;

				//it may mash up newexpressions as well
				if (n.NewExpression.check(node)) return true;

				//else - check that all arguments are known
				return r.test(node);
			})
		) {
			return true;
		}
	}
	return false;
}


module.exports = [
	//associative methods, ~ `[].concat(a, b) === [].concat(a).concat(b)`
	// {
	// 	match: 'CallExpression',

	// 	//TODO: think up the way to test `new Shit` (temporarily)
	// 	test: function (node) {
	// 		var callName = u.getCallName(node);
	// 		if (n.MemberExpression.check(node.callee) &&
	// 				(
	// 					n.ArrayExpression.check(u.getMemberExpressionSource(node.callee))
	// 				) &&
	// 				r.test(u.getMemberExpressionSource(node.callee))
	// 			) {
	// 			var callName = u.getCallName(node);
	// 			//method, accepting simple arguments
	// 			var isSafe = mutators.indexOf(callName) >= 0;
	// 			if (isSafe &&
	// 				(
	// 					(callName in Array.prototype) ||
	// 					(callName in String.prototype)
	// 				) &&
	// 				u.getCallArguments(node).every(function (node) {
	// 					//harmless methods (non-callable) may accept any functions
	// 					//as far they’re evaled unchanged
	// 					if (n.FunctionExpression.check(node)) return true;

	// 					//it may mash up newexpressions as well
	// 					if (n.NewExpression.check(node)) return true;

	// 					//else - check that all arguments are known
	// 					return r.test(node);
	// 				})
	// 			) {
	// 				return true;
	// 			}
	// 		}
	// 		return false;
	// 	},

	// 	eval: function (node) {
	// 		var callName = u.getCallName(node);
	// 		var args = u.getCallArguments(node);
	// 		var expSource = u.getMemberExpressionSource(node.callee);

	// 		var resultArray = expSource;

	// 		//for each expression from the arguments do single operation
	// 		args.forEach(function (arg) {
	// 			var evalResult = arg;
	// 			if (!n.NewExpression.check(arg)) {
	// 				evalResult = u.evalNode(arg);
	// 			}
	// 			resultArray[callName](evalResult);
	// 		});

	// 		return resultArray;
	// 	}
	// },

	//mapping methods
	{
		match: 'CallExpression',

		test: function (node) {
			if (n.MemberExpression.check(node.callee) &&
				(
					n.ArrayExpression.check(u.getMemberExpressionSource(node.callee)) ||
					u.isString(u.getMemberExpressionSource(node.callee))
				) &&
				r.test(u.getMemberExpressionSource(node.callee))
			) {
				var callName = u.getCallName(node);

				if (
					(
						(callName in Array.prototype) ||
						(callName in String.prototype)
					) &&
					u.getCallArguments(node).every(r.test)
				) {
					return true;
				}
			}
		},

		eval: u.evalNode
	},

	//default safe methods
	{
		match: 'CallExpression',

		test: testMutatorMethod,

		eval: u.evalNode
	},

];