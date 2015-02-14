/**
 * Eval simple expressions.
 * `1 + 2 + 4` → `7`
 *
 * @module  ast-eval/expression
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var isSimple = require('./util').isSimple;
var isIsolated = require('./util').isIsolated;
var isObject = require('./util').isObject;
var parse = require('esprima').parse;
var uneval = require('tosource');
var analyze = require('escope').analyze;

function evalExp(ast){
	var scopes = analyze(ast);

	types.visit(ast, {
		/** Catch entry nodes for optimizations */
		visitExpression: function(path){
			var node = path.node;

			//calls .valueOf or .toString on objects
			//so pass only literals && simple objects
			if (isSimple(node)) {
				return parse(uneval(eval(gen(node)))).body[0].expression;
			}

			this.traverse(path);
		}
	});

	return ast;
}


module.exports = evalExp;