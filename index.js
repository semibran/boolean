(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __exportStar = (target, module, desc) => {
    __markAsModule(target);
    if (typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__defProp(__create(__getProtoOf(module)), "default", {value: module, enumerable: true}), module);
  };

  // src/lib/parse.js
  var require_parse = __commonJS((exports, module) => {
    const debug = false;
    module.exports = function parse3(str) {
      let stack = [];
      for (let i = 0; i < str.length; i++) {
        let chr = str[i];
        if (chr === " ")
          continue;
        if (debug)
          console.log(chr, stack);
        let node = stack[stack.length - 1];
        let parent = stack[stack.length - 2];
        if (!node && chr !== "(" && chr !== ")") {
          if (chr === "'") {
            throw new Error("Failed to parse boolean expression " + str + ": Cannot NOT an undefined clause");
          }
          if (chr === "+") {
            throw new Error("Failed to parse boolean expression " + str + ": Cannot OR an undefined clause");
          }
          stack.push(chr);
          continue;
        }
        if (chr === "(") {
          if (!node) {
            let grp = ["grp"];
            stack.push(grp);
          } else if (node[0] === "grp" && node.length === 1 || node[0] === "or" && node.length === 2) {
            let grp = ["grp"];
            stack.push(grp);
            node.push(grp);
          } else {
            let grp = ["grp"];
            let and2 = ["and", node, grp];
            stack[stack.length - 1] = and2;
            stack.push(grp);
            if (parent)
              parent[parent.length - 1] = and2;
          }
          continue;
        }
        if (chr === ")") {
          let token2 = null;
          while (stack.length && (!token2 || token2[0] !== "grp")) {
            token2 = stack.pop();
          }
          if (!token2 || token2[0] !== "grp") {
            throw new Error("Failed to parse boolean expression " + str + ": Cannot terminate an undefined clause");
          }
          if (!token2[1]) {
            throw new Error("Failed to parse boolean expression " + str + ": Cannot parse an empty group");
          }
          if (debug)
            console.log("ended group", token2);
          stack.push(token2[1]);
          parent = stack[stack.length - 2];
          if (parent)
            parent[parent.length - 1] = token2[1];
          continue;
        }
        if (chr === "'") {
          if (node[0] === "or" && node.length === 2) {
            throw new Error("Failed to parse boolean expression " + str + ": Cannot NOT an incomplete OR clause");
          }
          if (node[0] === "grp") {
            throw new Error("Failed to parse boolean expression " + str + ": Cannot NOT an lparen");
          }
          let not = ["not", node];
          stack[stack.length - 1] = not;
          if (parent)
            parent[parent.length - 1] = not;
          continue;
        }
        if (chr === "+") {
          if (node[0] === "or" && node.length === 2) {
            throw new Error("Failed to parse boolean expression " + str + ": Cannot OR an incomplete OR clause");
          }
          let parent2 = null;
          let group = null;
          let i2 = stack.length;
          while (i2) {
            parent2 = stack[--i2];
            if (parent2[0] === "grp") {
              group = parent2;
              parent2 = parent2[1];
              break;
            }
          }
          let or = ["or", parent2];
          if (!group) {
            stack.length = i2;
            stack.push(or);
          } else {
            stack.length = i2 + 1;
            stack.push(or);
            group[group.length - 1] = or;
          }
          continue;
        }
        if (node[0] === "or" && node.length === 2) {
          node.push(chr);
          stack.push(chr);
          continue;
        }
        if (node[0] === "grp" && node.length === 1) {
          node.push(chr);
          stack.push(chr);
          continue;
        }
        let and = ["and", node, chr];
        stack[stack.length - 1] = and;
        stack.push(chr);
        if (parent)
          parent[parent.length - 1] = and;
      }
      let token = stack[0];
      if (token[0] === "or" && token.length === 2) {
        throw new Error("Failed to parse boolean expression " + str + ": Incomplete OR clause");
      }
      if (token[0] === "grp" || stack[stack.length - 1][0] === "grp") {
        throw new Error("Failed to parse boolean expression " + str + ": Unterminated group");
      }
      return token;
    };
  });

  // src/lib/args.js
  var require_args = __commonJS((exports, module) => {
    module.exports = function reduceargs(token) {
      let vars = reducevars(token);
      let args = [];
      for (let v of vars) {
        if (args.indexOf(v) >= 0)
          continue;
        args.push(v);
      }
      return args.sort();
    };
    function reducevars(token) {
      if (!isNaN(Number(token)))
        return [];
      if (typeof token === "string")
        return [token];
      let [type, x, y] = token;
      if (type === "not")
        return reducevars(x);
      return reducevars(x).concat(reducevars(y));
    }
  });

  // src/lib/fn.js
  var require_fn = __commonJS((exports, module) => {
    const reduceargs = require_args();
    module.exports = function fnify(token) {
      let str = strify(token);
      let args = reduceargs(token);
      return eval("(" + args.join(",") + ")=>" + str);
    };
    function strify(token, parent) {
      if (!Array.isArray(token))
        return token;
      let [type, x, y] = token;
      if (type === "not") {
        return "!" + strify(x, type);
      }
      if (type === "and") {
        let and = strify(x, type) + "&&" + strify(y, type);
        if (parent === "not") {
          return `(${and})`;
        } else {
          return and;
        }
      }
      if (type === "or") {
        let or = strify(x, type) + "||" + strify(y, type);
        if (parent === "not" || parent === "and") {
          return `(${or})`;
        } else {
          return or;
        }
      }
    }
  });

  // src/lib/bitstr.js
  var require_bitstr = __commonJS((exports, module) => {
    const fnify = require_fn();
    module.exports = function bitstr2(token) {
      let bits = "";
      let fn = fnify(token);
      let perms = Math.pow(2, fn.length);
      for (let i = 0; i < perms; i++) {
        let str = i.toString(2);
        while (str.length < fn.length) {
          str = "0" + str;
        }
        let argv = str.split("").map(Number);
        bits += Number(fn(...argv));
      }
      return bits;
    };
  });

  // src/lib/equals.js
  var require_equals = __commonJS((exports, module) => {
    const args = require_args();
    const bitstr2 = require_bitstr();
    module.exports = function equals3(token1, token2) {
      let args1 = args(token1);
      let args2 = args(token2);
      while (args1.length < args2.length) {
        let arg = args2.find((arg2) => !args1.includes(arg2));
        token1 = addarg(token1, arg);
        args1.push(arg);
      }
      while (args2.length < args1.length) {
        let arg = args1.find((arg2) => !args2.includes(arg2));
        token2 = addarg(token2, arg);
        args2.push(arg);
      }
      return parseInt(bitstr2(token1), 2) === parseInt(bitstr2(token2), 2);
    };
    function addarg(token, arg) {
      return ["and", ["or", 1, arg], token];
    }
  });

  // src/index.js
  const parse = __toModule(require_parse());
  const equals = __toModule(require_equals());
  const bitstr = __toModule(require_bitstr());
  const form = document.querySelector(".section.-form");
  const outputbox = document.querySelector(".output-box");
  const output = document.querySelector(".output");
  let state = {
    expr1: {
      token: null,
      input: document.querySelector("#expr1"),
      error: document.querySelector(".input-error.-expr1")
    },
    expr2: {
      token: null,
      input: document.querySelector("#expr2"),
      error: document.querySelector(".input-error.-expr2")
    }
  };
  listen(state.expr1);
  listen(state.expr2);
  form.onsubmit = (event) => {
    const {expr1, expr2} = state;
    event.preventDefault();
    validate(expr1);
    validate(expr2);
    if (expr1.token instanceof Error || expr2.token instanceof Error) {
      return;
    }
    if (equals.default(expr1.token, expr2.token)) {
      outputbox.classList.remove("-incorrect");
      outputbox.classList.add("-correct", "-result");
      output.innerHTML = expr1.input.value + " = " + expr2.input.value;
    } else {
      outputbox.classList.remove("-correct");
      outputbox.classList.add("-incorrect", "-result");
      output.innerHTML = expr1.input.value + " &NotEqual; " + expr2.input.value;
    }
  };
  function listen(expr) {
    const {input, error} = expr;
    const clear = (_) => error.innerText = "";
    input.onblur = (_) => validate(expr);
    input.onkeypress = clear;
    input.onpaste = clear;
    input.oninput = clear;
  }
  function validate(expr) {
    const {input, error} = expr;
    if (!input.value) {
      expr.token = "";
    } else
      try {
        expr.token = parse.default(input.value);
      } catch (err) {
        expr.token = err;
      }
    if (expr.token && !(expr.token instanceof Error) && bitstr.default(expr.token).length > Math.pow(2, 8)) {
      expr.token = new Error("Maximum number of vars is 8");
    }
    if (expr.token instanceof Error) {
      error.innerHTML = "&times; " + colonslice(expr.token.message);
    } else {
      error.innerText = "";
    }
  }
  function colonslice(str) {
    for (var i = str.length; i; ) {
      if (str[--i] === ":")
        break;
    }
    if (!i)
      return str;
    return str.slice(i + 2, str.length);
  }
  let year = document.querySelector("#year");
  year.innerText = new Date().getFullYear();
})();
//# sourceMappingURL=index.js.map
