var u = require('../util');
var n = require('ast-types').namedTypes;
var test = require('./').test;

module.exports = {
	match: 'MemberExpression',

	test: function (node) {
		//`{a:1}.a`, but not `[].x`
		if (test(node.object)) {
			//doesn’t call object method
			if (
				n.ObjectExpression.check(node.object) && !(node.property.name in Object.prototype)
			) return true;

			//doesn’t call string method
			if (
				u.isString(node.object) && !(node.property.name in String.prototype)
			) return true;

			//doesn’t call number method
			if (
				u.isNumber(node.object) && !(node.property.name in Number.prototype)
			) return true;

			//doesn’t call array method
			if (
				n.ObjectExpression.check(node.object) && !(node.property.name in Array.prototype)
			) return true;

			//doesn’t call function method
			if (
				n.FunctionExpression.check(node.object) && !(node.property.name in Function.prototype)
			) return true;
		}
	}
}