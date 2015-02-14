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


## Features

* Binary expressions
	* `1000 * 60 * 60` → `36e6`

* Logical expressions
	* `{a:1} && {b:2}` → `true`

* Simple arrays (ccjs doesn’t manage to do that)
	* `[1,2,3].concat(4, [5])` → `[1,2,3,4,5]`
	* `[1,2,3].map(function(x){ return x*2})` → `[2,4,6]`
	* `['a', 'b', 'c'].join(' ')` → `'a b c'`

* `Math` module expressions
	* `Math.sin(Math.Pi / 2 )` → `1`

* Any other static environment evaluations
	* `Crypto`
	* [TODO]

* Decompute object access (optionally)
	* `a['x'] = 1` → `a.x = 1`

* String expressions
	* `'a b c'.split(' ')` → `['a', 'b', 'c']`

* [pending] Eval small loops
	* `var x = []; for (var i = 0; i < 10; i++) {x[i] = 10*i;}`

* [pending] Substitute constants
	* `var x = 1; x + 2;` → `3;`

* [pending] Unwrap proxy functions

* [pending] remove unused props

* [pending] remove dead code
	* Empty isolated functions
	* Remove unused variables (after enabling constants)

* [pending] detect & collapse clones


## Options

[pending]

| Option | Default value | Description |
|---|---|---|
| optimal | `false` | Ignore eval results lengthen than initial source code |
| decompute | `false` | Try to evaluate computed properties |
| externs | `{}` | External constant values or functions |


## Precautions

* Ast-eval takes supposation that native environment hasn’t been changed and built-ins have it’s original or polyfilled methods. If you redefine the builtins, like with [sugar.js]() or similar library - make sure to provide it as externs.


[![NPM](https://nodei.co/npm/ast-eval.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ast-eval/)