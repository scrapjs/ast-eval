/**
 * Variables evaluation
 */

module.exports = {
	match: 'Identifier',
	test: function (node) {
		//known (global) identifiers
		// return node.name in global;

		//if statically calculable variable
		// return isCalculableVar(node);
		return false;
	}
};