/**
 * Eval expressions in AST.
 * Calls all sub-evals.
 *
 * @module ast-eval
 */

var evalExp = require('./expression');
var evalArray = require('./array');
var evalMath = require('./math');
var evalString = require('./string');


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

module.exports = evalAst;