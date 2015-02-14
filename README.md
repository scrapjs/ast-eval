# ast-eval [![Build Status](https://travis-ci.org/dfcreative/ast-eval.svg?branch=master)](https://travis-ci.org/dfcreative/ast-eval)

Statically eval expressions in AST. Similar to [static-eval](https://github.com/substack/static-eval), but returns optimized AST instead and performs some more evaluations.
Ast-eval also bundles a set of AST analysis utils.


## Use

```sh
npm install --save ast-eval
```

```js
var esprima = require('esprima');
var gen = require('escodegen').generate;
var astEval = require('ast-eval');

var ast = esprima.parse('[1, 2 === "2", 3+4*10, [2] === 2]');
ast = astEval(ast);

gen(ast); //'[1, false, 43, false]'
```


## Options

| Option | Default value | Description |
|---|---|---|
| optimize | `false` | Ignore eval results lengthen than initial source code |
| computeProps | `false` | Try to evaluate `computed` properties |
| externs | `{}` | External constant values or functions |


## Features

* [x] Binary expressions
	* [x] `1000 * 60 * 60` → `36e6`

* [x] Logical expressions
	* [x] `{a:1} && {b:2}` → `true`

* [x] Simple arrays (ccjs doesn’t manage to do that)
	* [x] `[1,2,3].concat(4, [5])` → `[1,2,3,4,5]`
	* [x] `[1,2,3].map(function(x){ return x*2})` → `[2,4,6]`
	* [x] `['a', 'b', 'c'].join(' ')` → `'a b c'`

* [x] `Math` module expressions
	* [x] `Math.sin(Math.Pi / 2 )` → `1`

* [ ] Any other static environment evaluations
	* [ ] `Crypto`
	* [ ] ...

* [x] Decompute object access (optionally)
	* [x] `a['x'] = 1` → `a.x = 1`

* [ ] String expressions
	* [ ] `'a b c'.split(' ')` → `['a', 'b', 'c']`

* [ ] Eval small loops
	* [ ] `var x = []; for (var i = 0; i < 10; i++) {x[i] = 10*i;}`

* [ ] Substitute constants
	* [ ] `var x = 1; x + 2;` → `3;`

* [ ] Unwrap proxy functions

* [ ] Remove unused props

* [ ] Undead code
	* [ ] Empty isolated functions
	* [ ] Remove unused variables (after enabling constants)

* [ ] Detect & collapse clones


## Precautions

* Ast-eval takes supposation that native environment isn’t changed and all built-ins have it’s original or polyfilled methods. If you redefine the built-ins, like with [sugar.js]() or similar library - make sure to provide it as externs.


[![NPM](https://nodei.co/npm/ast-eval.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ast-eval/)