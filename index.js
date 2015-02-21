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
var analyzeAst = require('./analyze');
var extend = require('xtend/mutable');
var hoist = require('ast-redeclare');
var r = require('./replacement');


/**
 * Init replacements.
 * Simple expressions go last to let more complex patterns trigger first.
 */
r.push(
	require('./replacement/arrayMutators'),
	require('./replacement/math'),
	require('./replacement/memberAccess'),
	require('./replacement/primitives'),
	require('./replacement/variable')
);


[].push.apply(r, require('./replacement/expression'));


/** Default options */
var defaults = {
	optimize: false,
	computeProps: false,
	externs: {}
};


/**
 * Eval AST with options passed
 */
function evalAst (ast, options) {
	options = extend({}, defaults, options);

	//fold variable declarations (so that only one entry declaration for a var).
	ast = hoist(ast);

	//analyze nodes
	analyzeAst(ast);

	//eval simple expressions
	types.visit(ast, {
		// catch entry nodes to eval
		visitNode: function(path){
			var node = path.node;

			//if node is evaluable
			if (r.test(node)) {

				var evaledNode = r.eval(node);

				//ignore unchanged node
				if (types.astNodesAreEquivalent(node, evaledNode)) return false;

				//compare optimized node result, ignore if it is lengthen
				if (options.optimize) {
					//TODO
				}

				//FIXME: analyze updated subtree

				return evaledNode;
			}

			//go deep to catch more complicated patterns before simple ones
			//like [1,2,3+4].call(fn);
			this.traverse(path);
		}
	});

	return ast;
}


evalAst.defaults = defaults;
module.exports = evalAst;