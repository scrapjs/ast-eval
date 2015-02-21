/**
 * List of replacement rules
 *
 * @module  ast-eval/replacement/index
 */


var replacements = [];


/**
 * Run every replacement, test whether at least one is passed.
 *
 * @param {Node} node AST Node to test
 *
 * @return {Boolean} Test result
 */
function test (node) {
	if (node === null) return true;

	var matchedReplacements = getMatchedRules (node);

	//if no match registered - return false
	if (!matchedReplacements.length) return false;

	for (var i = 0, l = matchedReplacements.length; i < l; i++) {
		if (matchedReplacements[i].test === true || matchedReplacements[i].test(node)) return true;
	}

	return false;
}


/**
 * Match node, find proper evaluation for it.
 */
function evalNode (node) {
	var matchedReplacements = getMatchedRules (node);
	if (!matchedReplacements.length) return node;

	for (var i = 0, l = matchedReplacements.length, replacement; i < l; i++) {
		var replacement = matchedReplacements[i];

		//FIXME: print matched expression
		if (replacement.test === true || replacement.test(node)) {
			//use specific eval or default eval
			return replacement.eval ? replacement.eval(node) : node;
		}
	}
}


/** Get list of matched rules for a node */
function getMatchedRules (node) {
	var matchedReplacements = replacements.filter(function (replacement) {
		return replacement.match === node.type;
	});

	return matchedReplacements;
}


replacements.eval = evalNode;
replacements.test = test;

module.exports = replacements;