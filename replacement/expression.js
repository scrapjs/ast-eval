/**
 * Simple evaluable expressions
 */

var u = require('../util');
var r = require('./');

module.exports = [
	{
		match: 'ArrayExpression',
		test: function (node) {
			return node.elements.every(r.test);
		},
		eval: u.evalNode
	},

	{
		match: 'UnaryExpression',
		test: function (node) {
			return r.test(node.argument);
		},
		eval: u.evalNode
	},

	{
		match: 'LogicalExpression',
		test: function (node) {
			return  (u.isObject(node.left) || r.test(node.left)) &&
					(u.isObject(node.right) || r.test(node.left));
		},
		eval: u.evalNode
	},

	//calls .valueOf or .toString on objects
	{
		match: 'BinaryExpression',
		test: function (node) {
			return r.test(node.left) && r.test(node.right);
		},
		eval: u.evalNode
	},

	{
		match: 'ConditionalExpression',
		test: function (node) {
			return r.test(node.test) && r.test(node.alternate) && r.test(node.consequent);
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
				return r.test(prop.value);
			});
		},
		eval: u.evalNode
	},

	{
		match: 'UpdateExpression',
		test: function (node) {
			return r.test(node.argument);
		},
		eval: u.evalNode
	},

	{
		match: 'FunctionExpression',
		test: function (node) {
			return u.isIsolated(node);
		}
	},

	//default safe fallback for call expressions
	{
		match: 'CallExpression',
		test: function (node) {
			//check that both callee is callable and all arguments are ok
			return r.test(node.callee) && node.arguments.every(r.test);
		},

		eval: u.evalNode
	}



	//FIXME: try to adopt `new Date` etc, to work with concat
	// if (n.NewExpression.check(node)) {
	// 	return r.test(node.callee) || n.Identifier.check(node.callee) && node.arguments.every(test);
	// }
];