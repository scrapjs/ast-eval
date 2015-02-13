/**
 * Pre-evaluate array expressions in AST:
 * `[1,2,3].map(function(x){return x*2})`
 * `[1,2,3].join(' ')`
 * etc.
 *
 * @module ast-eval/array
 */

var types = require('ast-types');
var n = types.namedTypes, b = types.builders;
var gen = require('escodegen').generate;
var parse = require('esprima').parse;
var isSimple = require('./util').isSimple;
var isIsolated = require('./util').isIsolated;
var isObject = require('./util').isObject;


function evalArray(ast){
	types.visit(ast, {
		visitCallExpression: function(path){
			this.traverse(path);
			var node = path.node;

			//simple array method call
			if (n.MemberExpression.check(node.callee) &&
				n.ArrayExpression.check(node.callee.object) &&
				isSimple(node.callee.object)
			) {
				var method;

				//method, accepting fn
				if (method = [
						'every',
						'map',
						'filter',
						'find',
						'findIndex',
						'reduce',
						'reduceRight',
						'some',
						'sort'
					].indexOf(node.callee.property.name) >= 0 &&
					n.FunctionExpression.check(node.arguments[0]) &&
					isIsolated(node.arguments[0])
				) {
					//eval array, return recreated evaled value
					return parse(JSON.stringify(eval(gen(node)))).body[0].expression;
				}

				//method, accepting simple arguments
				if (method = [
						'copyWithin',
						'includes',
						'indexOf',
						'join',
						'lastIndexOf',
						'concat',
						'push',
						'pop',
						'reverse',
						'shift',
						'slice',
						'splice',
						'toSource',
						'toString',
						'unshift'
					].indexOf(node.callee.property.name >= 0) &&
					node.arguments.every(isSimple)
				) {
					//eval array, return recreated evaled value
					return parse(JSON.stringify(eval(gen(node)))).body[0].expression;
				}
			}
		}
	});

	return ast;
}


module.exports = evalArray;