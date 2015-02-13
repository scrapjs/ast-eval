/**
 * Eval expressions in AST.
 * Calls all sub-evals.
 *
 * @module ast-eval
 */

var evalExp = require('./expression');
var evalArray = require('./array');


function evalAst(node){
	node = evalArray(node);
	node = evalExp(node);
	return node;
}

module.exports = evalAst;