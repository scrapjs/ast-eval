/**
 * Tests are borrowed from
 * https://github.com/substack/static-eval/blob/master/test/eval.js
 */
var assert = require('chai').assert;
var esprima = require('esprima');
var gen = require('escodegen').generate;
var astEval = require('./');


// var src = '[1, 2, 3+4*10+n, 3+4*10+(n||6), beep.boop(3+5), obj[""+"x"].y, 1===2+3-16/4, [2]==2, [2]!==2, [2]!==[2]]';

describe('Eseval', function(){
	it('boolean', function(){
		var src = '[1 && true, 1===2+3-16/4, [2]==2, [2]!==2, [2]!==[2]]';
		var ast = esprima.parse(src);

		ast = astEval(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, '[true,true,true,true,true];');
	});

	it.skip('unresolved', function(){
		var src = '[1,2,3+4*10*z+n,foo(3+5),obj[""+"x"].y]';
		var ast = esprima.parse(src);

		ast = astEval(ast);
		var out = gen(ast);
		console.log(out)

		// assert.deepEqual(eval(out), [true, true, true, true]);
	});

	it('resolved', function(){
		var src = '[1,2=="2",3.1+4*10+(2.14||6),""+"x", 2 > 4, [] + []]';
		var ast = esprima.parse(src);

		ast = astEval(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "[1,true,45.24,'x',false,''];");
	});

	it.skip('property getter', function(){
		var src = '[1,2=="2",3.1+4*10+(2.14||6),""+"x"]';
		var ast = esprima.parse(src);

		ast = astEval(ast);
		var out = gen(ast);

		assert.deepEqual(eval(out), [1, true, 45.24, 'x']);
	});

	it('maths');

	it('dates');

	it('arrays');

	it('decalc props');


	it('decalculated properties');

	it.skip('scoped variables', function(){
		'[1,2,3+4*10+(n||6),foo(3+5),obj[""+"x"].y]';
		'(function(){var x = 2; return x;})() + 1';
	});

	it('array methods', function(){
		var src = '[1, 2, 3].map(function(n) {return n * 2 })';
		var ast = esprima.parse(src);

		ast = astEval(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "[2,4,6];");
	});

	it.skip('unresolvable array methods', function(){
		'[1,2,x].map(function(n){return n;}';
		'[1,2,3].map(function(n){window; return n;}';
	});

	it('array mutators', function(){
		var src = '[1, 2, 3].concat(4, [5])';
		var ast = esprima.parse(src);

		ast = astEval(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "[1,2,3,4,5];");
	});

	it.skip('unresolvable array mutators', function(){
		'[1, 2, x].concat(4, [5])'
		'[1, 2, 3].concat(4, [x])'
	});
});


assert.equal();