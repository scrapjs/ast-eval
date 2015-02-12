# ast-eval [![Build Status](https://travis-ci.org/dfcreative/ast-eval.svg?branch=master)](https://travis-ci.org/dfcreative/ast-eval)

Statically eval expressions in AST. Very similar to [static-eval](https://github.com/substack/static-eval), but returns optimized AST instead.


## Use

```sh
npm install --save ast-eval
```

```js
var esprima = require('esprima');
var gen = require('escodegen').generate;
var astEval = require('ast-eval');

var ast = esprima.parse('[1, 2 == '2', 3+4*10, [2]==2]');
ast = astEval(ast);

gen(ast); //'[1, false, 43, false]'
```



[![NPM](https://nodei.co/npm/ast-eval.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ast-eval/)