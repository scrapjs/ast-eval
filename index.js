/**
 * Eval expressions in AST.
 * Calls all sub-evals.
 *
 * @module ast-eval
 */

var evalExp = require('./expression');
var evalArray = require('./array');
var evalString = require('./string');


/**
 * Cumulatively eval AST, eval all possible evaluable things
 */
function evalAst(node){
	node = evalArray(node);
	node = evalExp(node);
	return node;
}


evalAst.expression = evalExp;
evalAst.array = evalArray;
evalAst.string = evalString;

module.exports = evalAst;