/**
 * Some helpers
 * @module ast-eval/util
 */

var analyzeScopes = require('escope').analyze;
var q = require('esquery');
var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var evalAst = require('./');
var parse = require('esprima').parse;
var uneval = require('tosource');
var gen = require('escodegen').generate;
var a = require('./analyze');
var r = require('./replacement');


/**
 * Get an identifier
 * check whether it is variable
 * and if it is statically evaluable
 */
function isCalculableVar (node) {
	// var nodeData = a.getData(node);
	// var scope = nodeData.scope;

	// var reference = nodeData.reference;
	// var variable = reference.resolved;

	// console.log('node:', node);
	// console.log('var:', variable);
	// console.log('reference:', reference);

	// console.log(nodeData)
	//how to analyze variables?
	//via lifecycle: declaration → [operations] → current use
	//detect which other variables this one depends on in operations
	//assess whether it is statically calculable to calculate each other variable in operations (they’re independent)
	//and if it is, statically calculate
	//via `calcVar()` and `isCalculableVar()`

	//go by each reference from declaration up to current one,

	return false;
}


/** Test whether literal is a string */
function isString (node) {
	if (n.Literal.check(node) && typeof node.value === 'string') return true;
}
/** Test whether literal is a string */
function isNumber (node) {
	if (n.Literal.check(node) && typeof node.value === 'number') return true;
}


/** Test whether node is an object */
function isObject (node) {
	if (n.ArrayExpression.check(node)) return true;
	if (n.ObjectExpression.check(node)) return true;
	if (n.FunctionExpression.check(node)) return true;
	if (n.ThisExpression.check(node)) return true;
}


/** Check whether function doesn’t use external variables */
//FIXME: actually check that function has no assignment expressions to external vars, or doesn’t use them in any way.
function isIsolated (node) {
	//refuse non-fn nodes
	if (!n.FunctionExpression.check(node)) return;

	//if node refers to external vars - not isolated
	var scope = analyzeScopes(node).scopes[0];
	if (scope.through.length) return;

	//also if it includes `ThisExpression` - ignore it, as far `this` isn’t clear
	if (q(node, 'ThisExpression').length) return;

	return true;
}


/** Test whether node is transferable as is (with no eval) */
function isTransferable (node) {
	if (n.FunctionExpression.check(node)) return true;
	if (n.NewExpression.check(node)) return true;
}


/** Return name of prop in call expression */
function getCallName (node) {
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
function getCallArguments (node) {
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
function getMemberExpressionSource (node) {
	if (!n.MemberExpression.check(node)) return;

	//go deep
	while (n.MemberExpression.check(node)) {
		node = node.object;
	}

	return node;
}


/** Get node’s computed property, if node is computed */
function getPropertyName (node) {
	if (!n.MemberExpression.check(node)) return;

	//Math['P' + 'I']
	if (node.computed) {
		if (r.test(node.property)) {
			return r.eval(node.property);
		}

		else return;
	}

	//Math.PI
	else {
		return node.property.name;
	}
}


/** Return member expression with decalculated properties, if possible */
function decompute (node) {
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


/**
 * Get evaluated node (shrunk)
 *
 * @param {Node} node Simple node
 */
function evalNode (node) {
	//wrap object expression: `{}` → `({})`
	// if (n.ObjectExpression.check(node))
	node = b.expressionStatement(node);

	//wrap uneval result to expression so to avoid bad uneval, like `{}` → `({})`
	return parse('(' + uneval(eval(gen(node))) + ')').body[0].expression;
}



module.exports = {
	getMemberExpressionSource: getMemberExpressionSource,
	getCallName: getCallName,
	getPropertyName: getPropertyName,
	getCallArguments: getCallArguments,
	isString: isString,
	isObject: isObject,
	isIsolated: isIsolated,
	isTransferable: isTransferable,
	isNumber: isNumber,
	decompute: decompute,
	evalNode: evalNode
};