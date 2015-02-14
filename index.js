/**
 * Eval expressions in AST.
 * Calls all sub-evals.
 *
 * @module ast-eval
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var u = require('./util');
var parse = require('esprima').parse;
var uneval = require('tosource');
var analyze = require('escope').analyze;
var extend = require('xtend/mutable');


/** Default options */
var defaults = {
	optimize: false,
	decompute: false,
	externs: {}
};


/**
 * Eval AST with options passed
 */
function evalAst(ast, options){
	options = extend({}, defaults, options);

	types.visit(ast, {
		/** Catch entry nodes for optimizations */
		visitExpression: function(path){
			var node = path.node;

			//ignore some unevaluable expressions
			if (n.Literal.check(node)) return false;
			if (n.Identifier.check(node)) return false;

			if (u.isSimple(node)) {
				var evaledNode = u.evalNode(node);

				//ignore unchanged node
				if (types.astNodesAreEquivalent(node, evaledNode)) return false;

				//compare optimized node result, ignore if it is lengthen
				if (options.optimize) {
					//TODO
				}
				return evaledNode;
			}

			//goes last to catch some complicated patterns first, if any
			this.traverse(path);
		}
	});

	return ast;
}


evalAst.defaults = defaults;
module.exports = evalAst;