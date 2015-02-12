/**
 * Eval expressions
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;

function astEval(ast){
	types.visit(ast, {
		visitExpression: function(path){
			//go deep first
			this.traverse(path);

			var node = path.node;

			//handle binary expressions
			if (
				(n.BinaryExpression.check(node) || n.LogicalExpression.check(node)) &&
				(isPlainValue(node.left) && isPlainValue(node.right))
			) {
				var leftValue = eval(gen(node.left)),
					rightValue = eval(gen(node.right)),
					value;

				var op = node.operator;

				if (op === "==") value = leftValue == rightValue;
				if (op === "!=") value = leftValue != rightValue;
				if (op === "===") value = leftValue === rightValue;
				if (op === "!==") value = leftValue !== rightValue;
				if (op === "<") value = leftValue < rightValue;
				if (op === "<=") value = leftValue <= rightValue;
				if (op === ">") value = leftValue > rightValue;
				if (op === ">=") value = leftValue >= rightValue;
				if (op === "<<") value = leftValue << rightValue;
				if (op === ">>") value = leftValue >> rightValue;
				if (op === ">>>") value = leftValue >>> rightValue;
				if (op === "+") value = leftValue + rightValue;
				if (op === "-") value = leftValue - rightValue;
				if (op === "*") value = leftValue * rightValue;
				if (op === "/") value = leftValue / rightValue;
				if (op === "%") value = leftValue % rightValue;
				if (op === "|") value = leftValue | rightValue;
				if (op === "^") value = leftValue ^ rightValue;
				if (op === "&") value = leftValue & rightValue;
				if (op === "instanceof") value = leftValue instanceof rightValue;
				// if (op === "..") value = leftValue .. rightValue;

				if (op === "||") value = leftValue || rightValue;
				if (op === "&&") value = leftValue && rightValue;

				path.replace(b.literal(value));
			}
		}
	});


	return ast;
}

/**
 * Check whether node contains no nested variable literals
 */
function isPlainValue(node){
	if (n.Literal.check(node)) return true;
	if (n.ArrayExpression.check(node)) {
		return node.elements.every(isPlainValue);
	}
}


module.exports = astEval;