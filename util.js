/**
 * Some helpers
 * @module ast-eval/util
 */


var analyze = require('escope').analyze;
var q = require('esquery');
var types = require('ast-types');
var n = types.namedTypes, b = types.builders;


/** Test whether node is literal or contains only literals  */
function isSimple(node){
	if (n.Literal.check(node)) return true;
	if (n.ArrayExpression.check(node)) return node.elements.every(isSimple);
	if (n.ObjectExpression.check(node)) return node.properties.every(function(prop){
		return isSimple(prop.value);
	});
}


/** Test whether node is object */
function isObject(node){
	if (n.ArrayExpression.check(node)) return true;
	if (n.ObjectExpression.check(node)) return true;
	if (n.FunctionExpression.check(node)) return true;
	if (n.ThisExpression.check(node)) return true;
}


/** Checks whether function doesn’t use external variables */
function isIsolated(node){
	//if node refers to external vars - not isolated
	var scope = analyze(node).scopes[0];
	if (scope.through.length) return;

	//also if it includes `ThisExpression` - ignore it
	if (q(node, 'ThisExpression').length) return;

	return true;
}


exports.isSimple = isSimple;
exports.isObject = isObject;
exports.isIsolated = isIsolated;