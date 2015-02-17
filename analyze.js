/**
 * Analyze AST, associate data with nodes.
 *
 * @module  ast-eval/data
 */

var isObject = require('is-object');
var extend = require('xtend/mutable');
var types = require('ast-types');
var escope = require('escope');
var visit = types.visit;
var n = types.namedTypes;


/** Cache of data associated with nodes */
var nodeCache = new WeakMap();



/** Default data associated with node */
var defaultNodeData = {
	//self
	node: null,

	//parent node
	parent: null,

	//scope from escope
	scope: null,

	//reference this node resolves to (from scope)
	reference: null
};


/**
 * Analyze ast, save info for each node within
 * Variable info
 * Scope
 * Infered type
 * Mutability
 */
function analyze(node){
	var scopeMan = escope.analyze(node, {
		ignoreEval: true,
		optimistic: true
	});

	visit(node, {
		visitNode: function(path){
			var node = path.node;

			//save parent
			setData(node, 'parent', path.parent && path.parent.node);

			//find out & save current scope
			//FIXME: for undeclared global vars scope is undefined
			var scopeNode = path.scope.node;
			var scope = scopeMan.scopes.find(function(scope){
				return scope.block === scopeNode;
			});
			setData(node, 'scope', scope);


			//find out and save variable with it’s own scope
			if (n.Identifier.check(node)) {

				//find variable in global list of variables
				var reference = findReference(node);

				if (reference) {
					setData(node, 'reference', reference);
				}
			}

			this.traverse(path);
		}
	});


	/** Find reference of a node within the scopeManager (all scopes for the node) */
	function findReference (node) {
		var result;

		n.Identifier.assert(node);

		//go through all scopes
		scopeMan.scopes.some(function (scope) {
			//if scope contains reference to the identifier passed - get it’s variable
			return scope.references.some(function(reference){
				if (reference.identifier === node) {
					return result = reference;
				}
			});
		});

		return result;
	}
}



/**
 * Set node data
 */
function setData (node, key, value) {
	var nodeData;
	if (nodeCache.has(node)) {
		nodeData = nodeCache.get(node);
	} else {
		nodeData = extend({}, defaultNodeData, {node: node});
		nodeCache.set(node, nodeData);
	}

	//set multiple data
	if (isObject(key)) {
		nodeData = extend(nodeData, key);
	}

	//set single value
	else {
		nodeData[key] = value;
	}

	return nodeData;
}


/**
 * Retrieve node data
 */
function getData(node, key){
	if (arguments.length === 1) {
		return nodeCache.get(node);
	}
	else {
		return nodeCache.get(node)[key];
	}
}


module.exports = analyze;
module.exports.getData = getData;
module.exports.setData = setData;