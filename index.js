/**
 * Eval expressions in AST.
 * Calls all sub-evals.
 *
 * @module ast-eval
 */

var evalExp = require('./lib/expression');
var evalArray = require('./lib/array');
var evalString = require('./lib/string');


/**
 * Cumulatively eval AST, eval all possible evaluable things
 */
function evalAst(node){
	throw Error('Unimplemented');
	return node;
}


evalAst.expression = evalExp;
evalAst.array = evalArray;
evalAst.string = evalString;

module.exports = evalAst;