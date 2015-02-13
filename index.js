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

	//FIXME: eval till no node has changed
	// node = evalString(node);
	// node = evalArray(node);
	// node = evalString(node);
	node = evalArray(node);

	node = evalMath(node);
	// node = evalExp(node);
	// node = evalMath(node);
	node = evalExp(node);
	return node;
}


evalAst.expression = evalExp;
evalAst.array = evalArray;
evalAst.string = evalString;

module.exports = evalAst;