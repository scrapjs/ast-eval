/**
 * Some helpers
 * @module ast-eval/util
 */


var analyze = require('escope').analyze;
var q = require('esquery');
var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var evalAst = require('../');


/**
 * Analyze ast, save info for each node within
 * Variable info
 * Scope
 * Infered type
 * Mutability
 */
function analyze(node){
	//data associated with node
	var data = {};

	nodeData.set(node, data);
}


/**
 * Test whether node is statically evaluable, in general.
 * Specifically that it is literal or contains only statically known literals.
 *
 * @param {Node} node AST Node to test
 *
 * @return {Boolean} Test result
 */
function isSimple(node){
	if (n.Literal.check(node)) return true;
	if (n.UnaryExpression.check(node)) return isSimple(node.argument);
	if (n.LogicalExpression.check(node)) {
		return  (isObject(node.left) || isSimple(node.left)) &&
				(isObject(node.right) || isSimple(node.left));
	}

	//calls .valueOf or .toString on objects
	//so pass only literals && simple objects
	if (n.BinaryExpression.check(node)) return isSimple(node.left) && isSimple(node.right);
	if (n.ConditionalExpression.check(node)) return isSimple(node.test) && isSimple(node.alternate) && isSimple(node.consequent);
	if (n.SequenceExpression.check(node)) return node.expressions.every(isSimple);
	if (n.ArrayExpression.check(node)) return node.elements.every(isSimple);
	if (n.ObjectExpression.check(node)) return node.properties.every(function(prop){
	});
	if (n.UpdateExpression.check(node)) return isSimple(node.argument);
	if (n.FunctionExpression.check(node)) return isIsolated(node);
	if (n.CallExpression.check(node)) {
		return isSimple(node.callee);
	}
	if (n.MemberExpression.check(node)) {
		if (isSimple(node.object)) return true;

		//catch Math.*
		if (
			n.Identifier.check(node.object) &&
			node.object.name === 'Math'
		){
			//Math['P' + 'I']
			if (node.computed) {
				if (isSimple(node.property)) {
					var propName = evalAst(node.property);
					return propName in Math;
				}
			}
			//Math.PI
			else {
				return node.property.name in Math;
			}
		}
	}
}

/** Test whether literal is string */
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
//FIXME: actually check that function has no assignment expressions to external vars, or doesn’t use them in any way.
function isIsolated(node){
	//refuse non-fn nodes
	if (!n.FunctionExpression.check(node)) return;

	//if node refers to external vars - not isolated
	var scope = analyze(node).scopes[0];
	if (scope.through.length) return;

	//also if it includes `ThisExpression` - ignore it, as far `this` isn’t clear
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