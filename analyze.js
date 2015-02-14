/**
 * Metadata associated with nodes
 *
 * @module  ast-eval/data
 */
var nodeData = new WeakMap();


/** Get info about a node (within the context of scope) */
function getData(node){
	return nodeData.get(node);
}



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


module.exports = node;