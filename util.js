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
	if (n.UnaryExpression.check(node)) return isSimple(node.argument);
	if (n.LogicalExpression.check(node)) return isSimple(node.left) && isSimple(node.right);
	if (n.BinaryExpression.check(node)) return isSimple(node.left) && isSimple(node.right);
	if (n.ConditionalExpression.check(node)) return isSimple(node.test) && isSimple(node.alternate) && isSimple(node.consequent);
	if (n.MemberExpression.check(node)) return isSimple(node.object);
	if (n.SequenceExpression.check(node)) return node.expressions.every(isSimple);
	if (n.ArrayExpression.check(node)) return node.elements.every(isSimple);
	if (n.ObjectExpression.check(node)) return node.properties.every(function(prop){
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


/** Check whether function doesn’t use external variables */
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


/** Return name of prop in call expression */
function getCallName(node){
	if (!n.CallExpression.check(node)) return;
	if (!n.MemberExpression.check(node.callee)) return;

	//a.b()
	if (
		!n.MemberExpression.check(node.callee.object) &&
		!node.callee.computed
	)
	return node.callee.property.name;

	//a.b.call()
	if (
		n.MemberExpression.check(node.callee.object) &&
		node.callee.property.name === 'call'
	)
	return node.callee.object.property.name;

	//a.b.apply()
	if (
		n.MemberExpression.check(node.callee.object) &&
		node.callee.property.name === 'apply'
	)

	return node.callee.object.property.name;
}


/** Return arguments of a call */
function getCallArguments(node){
	if (!n.CallExpression.check(node)) return;
	if (!n.MemberExpression.check(node.callee)) return;

	//a.b(1,2,3)
	if (
		!n.MemberExpression.check(node.callee.object) &&
		!node.callee.computed
	)
	return node.arguments;

	//a.b.call(ctx, 1,2,3)
	if (
		n.MemberExpression.check(node.callee.object) &&
		node.callee.property.name === 'call'
	)
	return node.arguments.slice(1);

	//a.b.apply(ctx, [1,2,3])
	if (
		n.MemberExpression.check(node.callee.object) &&
		node.callee.property.name === 'apply' &&
		n.ArrayExpression.check(node.arguments[1])
	)

	return node.arguments[1].elements;
}


/** Get member expression initial node */
function getMemberExpressionSource(node){
	if (!n.MemberExpression.check(node)) return;

	//go deep
	while (n.MemberExpression.check(node)) {
		node = node.object;
	}

	return node;
}


/** Return member expression with decalculated properties, if possible */
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

exports.getMemberExpressionSource = getMemberExpressionSource;
exports.getCallName = getCallName;
exports.getCallArguments = getCallArguments;
exports.isString = isString;
exports.isSimple = isSimple;
exports.isObject = isObject;
exports.isIsolated = isIsolated;
exports.decompute = decompute;