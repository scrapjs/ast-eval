/**
 * Tests are borrowed from
 * https://github.com/substack/static-eval/blob/master/test/eval.js
 */
var assert = require('chai').assert;
var parse = require('esprima').parse;
var gen = require('escodegen').generate;
var astEval = require('./');
var u = require('./util');


// var src = '[1, 2, 3+4*10+n, 3+4*10+(n||6), beep.boop(3+5), obj[""+"x"].y, 1===2+3-16/4, [2]==2, [2]!==2, [2]!==[2]]';

describe('Expressions', function(){
	it('boolean', function(){
		var src = '[1 && true, 1===2+3-16/4, [2]==2, [2]!==2, [2]!==[2]]';
		var ast = parse(src);

		ast = astEval.expression(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, '[true,true,true,true,true];');
	});

	it.skip('unresolved', function(){
		var src = '[1,2,3+4*10*z+n,foo(3+5),obj[""+"x"].y]';
		var ast = parse(src);

		ast = astEval.expression(ast);
		var out = gen(ast);
		console.log(out)

		// assert.deepEqual(eval(out), [true, true, true, true]);
	});

	it('resolved', function(){
		var src = '[1,2=="2",3.1+4*10+(2.14||6),""+"x", 2 > 4, [] + []]';
		var ast = parse(src);

		ast = astEval.expression(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "[1,true,45.24,'x',false,''];");
	});

	it('proper order', function(){
		var src1 = '1 + 2 * 3';
		var ast1 = parse(src1);
		ast1 = astEval.expression(ast1);
		var out1 = gen(ast1, {format: {indent: {style: ''}, newline: ''}});

		var src2 = '2 * 3 + 1';
		var ast2 = parse(src2);
		ast2 = astEval.expression(ast2);
		var out2 = gen(ast1, {format: {indent: {style: ''}, newline: ''}});

		assert.equal(out1, out2);
	});


	it('unary operator', function(){
		var src = '-1 + 2';
		var ast = parse(src);
		ast = astEval.expression(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.equal(out, '1;');
	});

	it('Math primitives', function(){
		var src = '- Math.PI + Math.PI';
		var ast = parse(src);
		ast = astEval.expression(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.equal(out, '0;');
	});

	it.skip('Ignore math non-primitives', function(){
		'Math.sin + 1';
	});


	it.skip('property getter', function(){
		var src = '[1,2=="2",3.1+4*10+(2.14||6),""+"x"]';
		var ast = parse(src);

		ast = astEval(ast);
		var out = gen(ast);

		assert.deepEqual(eval(out), [1, true, 45.24, 'x']);
	});

	it('maths', function(){
		var src = 'Math.sin(Math.PI / 2)';
	});

	it('dates');

	it('decalc props');


	it.skip('scoped variables', function(){
		'[1,2,3+4*10+(n||6),foo(3+5),obj[""+"x"].y]';
		'(function(){var x = 2; return x;})() + 1';
	});
});



describe('Array', function(){
	it('map', function(){
		var src = '[1, 2, 3].map(function(n) {return n * 2 })';
		var ast = parse(src);

		ast = astEval.array(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "[2,4,6];");
	});

	it('concat', function(){
		var src = '[1, 2, 3].concat(4, [5], {}, function(){})';
		var ast = parse(src);

		ast = astEval.array(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "[1,2,3,4,5,{},function () {}];");
	});

	it.skip('unresolvable transforms', function(){
		'[1,2,x].map(function(n){return n;}';
		'[1,2,3].map(function(n){window; return n;}';
	});

	it('mutators', function(){
		var src = '[1, 2, 3].concat(4, [5])';
		var ast = parse(src);

		ast = astEval.array(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "[1,2,3,4,5];");
	});

	it.skip('unresolvable mutators', function(){
		'[1, 2, x].concat(4, [5])'
		'[1, 2, 3].concat(4, [x])'
	});

	it('join', function(){
		var src = '["a", "b", "c"].join(" ")';
		var ast = parse(src);

		ast = astEval.array(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "'a b c';");
	});

});


describe('Decompute', function(){
	it('decompute', function(){
		var src = 'a["x"] = 1;';
		var ast = parse(src);

		ast = u.decompute(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "a.x = 1;");
	});
});


describe.skip('Math', function(){
	it('functions', function(){
		var src = 'Math.sin(Math.PI / 2)';
		var ast = parse(src);

		ast = astEval(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "1;");
	});
});


describe('String', function(){
	it('prototype methods', function(){
		var src = '"a_b_c".split("_")';
		var ast = parse(src);

		ast = astEval.string(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "['a','b','c'];");
	});

	it.skip('refuse methods', function(){
		'"a".badMethod'
	});

	it('call/apply method', function(){
		var src = '"".split.call("a_b_c", "_")';
		var ast = parse(src);

		ast = astEval.string(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "['a','b','c'];");
	});

	it('static methods');

	it.skip('prototype methods', function(){
		var src = 'String.prototype.split.call("a_b_c", "_")';
		var ast = parse(src);

		ast = astEval.string(ast);
		var out = gen(ast, {format: {indent: {style: ''}, newline: ''}});

		assert.deepEqual(out, "['a','b','c'];");
	});
});

describe('loops', function(){

});

assert.equal();