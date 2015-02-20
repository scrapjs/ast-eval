# ast-eval [![Build Status](https://travis-ci.org/dfcreative/ast-eval.svg?branch=master)](https://travis-ci.org/dfcreative/ast-eval)

Statically evaluate expressions in AST, also known as [constants folding](http://en.wikipedia.org/wiki/Constant_folding). Useful for precompilation tasks.


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


## API

### preeval(Node, options) → Node

Evaluate expressions in a Node, return a new Node with optimized shorten expression nodes.

<!--
| Option | Default value | Description |
|---|---|---|
| optimize | `false` | Ignore eval results lengthen than initial source code |
| computeProps | `false` | Try to evaluate `computed` properties |
| externs | `{}` | External constant values or functions |
| exports | `''` | List of variables to provide as exports |
| evalGlobals | `true` | Ast-eval takes supposation that native environment isn’t changed and all built-ins have it’s original or polyfilled methods. If you redefine the built-ins, like with [sugar.js]() or similar library - make sure to provide it as externs. Or you can set `evalGlobals=true` to avoid evaluating globals. |
-->


## Features

* [x] Fold expressions
	* [x] Binary expressions: `1000 * 60 * 60` → `36e6`
	* [x] Logical expressions: `{a:1} && {b:2}` → `true`
	* [x] Math expressions: `Math.sin(Math.Pi / 2 )` → `1`

* [x] Fold arrays
	* [x] Safe methods: `[1,2,3].concat(4, [5])` → `[1,2,3,4,5]`
	* [x] Unsafe methods: `[1,2,3].map(function(x){ return x*2})` → `[2,4,6]`
	* [ ] Static methods: `Array.from([1, 2, 3], function(x){ return x*2})` → `[2,4,6]`
	* [ ] Prototype methods: `Array.prototype.slice.call([1,2,3], 1,2)` → `[2]`

* [ ] Fold static globals

* [x] Decompute object access (optionally)
	* [x] `a['x'] = 1` → `a.x = 1`

* [x] Fold strings
	* [x] `'a b c'.split(' ')` → `['a', 'b', 'c']`

* [ ] [Propagate constants](http://en.wikipedia.org/wiki/Constant_folding#Constant_propagation)
	* [ ] Simple flow analysis: `var x = 1; x + 2;` → `3;`
	* [ ] Scope analysis
	* [ ] Method substitution: `var slice = Array.prototype.slice; var x = [1,2,3]; var y = slice(x)'`

* [ ] Fold loops
	* [ ] `var x = []; for (var i = 0; i < 10; i++) {x[i] = 10*i;}`

* [ ] Fold proxy functions

* [ ] Remove unused props

* [ ] Undead code
	* [ ] Empty isolated functions
	* [ ] Remove unused variables (after enabling constants)
	* [ ] Remove unused functions
	* [ ] Remove unused properties

* [ ] Fold clone-code
	* `a.x`×3 → `var _a = a; _a.x`

* [ ] Data-flow analysis
	* [ ] Precall functions
	* [ ] Substitute variables

* [ ] Provide exports

* [ ] Fold primitives
	* [ ] new Array([1,2,3,...])
	* [ ] [1,2,3,...]

* [ ] Rearrange things
	* [ ] Hoist functions (place after first use)
	* [ ] Fold variable declarations



## References

* [List of compiler optimizations](http://en.wikipedia.org/wiki/Optimizing_compiler) — ideas of folding.
* Substack’s [static-eval](https://github.com/substack/static-eval) — evaluate static expressions.
* [esmangle](https://github.com/estools/esmangle)


[![NPM](https://nodei.co/npm/ast-eval.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ast-eval/)