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

function isString(node){
	if (n.Literal.check(node) && typeof node.value === 'string') return true;
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
	//refuse non-fn nodes
	if (!n.FunctionExpression.check(node)) return;

	//if node refers to external vars - not isolated
	var scope = analyze(node).scopes[0];
	if (scope.through.length) return;

	//also if it includes `ThisExpression` - ignore it
	if (q(node, 'ThisExpression').length) return;

	return true;
}


/** Return similar member expression with decalculated properties */
function decompute(node){
	types.visit(node, {
		visitMemberExpression: function(path){
			//resolve deep first
			this.traverse(path);
			var node = path.node;

			if (node.computed &&
				isString(node.property)
			) {
				node.computed = false;
				path.get('property').replace(b.identifier(node.property.value));
			}
		}
	});

	return node;
}

exports.isString = isString;
exports.isSimple = isSimple;
exports.isObject = isObject;
exports.isIsolated = isIsolated;
exports.decompute = decompute;