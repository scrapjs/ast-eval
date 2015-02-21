/**
 * Simple evaluable expressions
 */

var u = require('../util');
var test = require('./').test;

module.exports = [
	{
		match: 'ArrayExpression',
		test: function (node) {
			return node.elements.every(test);
		},
		eval: u.evalNode
	},

	{
		match: 'UnaryExpression',
		test: function (node) {
			return test(node.argument);
		},
		eval: u.evalNode
	},

	{
		match: 'LogicalExpression',
		test: function (node) {
			return  (u.isObject(node.left) || test(node.left)) &&
					(u.isObject(node.right) || test(node.left));
		},
		eval: u.evalNode
	},

	//calls .valueOf or .toString on objects
	{
		match: 'BinaryExpression',
		test: function (node) {
			return test(node.left) && test(node.right);
		},
		eval: u.evalNode
	},

	{
		match: 'ConditionalExpression',
		test: function (node) {
			return test(node.test) && test(node.alternate) && test(node.consequent);
		},
		eval: u.evalNode
	},

	{
		match: 'SequenceExpression',
		test: function (node) {
			return node.expressions.every(test);
		},
		eval: u.evalNode
	},

	{
		match: 'ObjectExpression',
		test: function (node) {
			return node.properties.every(function(prop){
				return test(prop.value);
			});
		},
		eval: u.evalNode
	},

	{
		match: 'UpdateExpression',
		test: function (node) {
			return test(node.argument);
		},
		eval: u.evalNode
	},

	{
		match: 'FunctionExpression',
		test: function (node) {
			return u.isIsolated(node);
		}
	},



		//FIXME: try to adopt `new Date` etc, to work with concat
		// if (n.NewExpression.check(node)) {
		// 	return test(node.callee) || n.Identifier.check(node.callee) && node.arguments.every(test);
		// }
];