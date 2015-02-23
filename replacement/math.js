var n = require('ast-types').namedTypes;
var isEvaluable = require('./').test;
var u = require('../util');
var isPrimitive = require('is-primitive');
var r = require('./');

module.exports = [
	//Math.const
	{
		match: 'MemberExpression',

		test: function (node) {
			var source = u.getMemberExpressionSource(node);

			if (source.name !== 'Math') return false;

			var propName = u.getPropertyName(node);

			return propName !== undefined && propName in Math && isPrimitive(Math[propName]);
		},

		eval: u.evalNode
	},

	//Math.fun()
	{
		match: 'CallExpression',
		test: function (node) {
			if (n.MemberExpression.check(node.callee)) {
				var source = u.getMemberExpressionSource(node.callee);

				if (source.name !== 'Math') return false;
			}

			var propName = u.getPropertyName(node.callee);

			return propName in Math && node.arguments.every(r.test);
		},

		eval: u.evalNode
	}
];