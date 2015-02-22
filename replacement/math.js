var n = require('ast-types').namedTypes;
var isEvaluable = require('./').test;
var u = require('../util');

module.exports = {
	match: 'MemberExpression',

	test: function (node) {
		//catch Math.*
		if (
			n.Identifier.check(node.object) &&
			node.object.name === 'Math'
		){
			//Math['P' + 'I']
			if (node.computed) {
				if (u.isEvaluable(node.property)) {
					var propName = u.evalNode(node.property);
					return propName in Math;
				}
			}

			//Math.PI
			else {
				return node.property.name in Math;
			}
		}
	},

	eval: function (node) {
		return u.evalNode(node);
	}
};