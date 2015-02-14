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