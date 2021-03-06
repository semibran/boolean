import parse from "./lib/parse"
import equals from "./lib/equals"
import id from "./lib/bitstr"

const form = document.querySelector(".section.-form")
const outputbox = document.querySelector(".output-box")
const output = document.querySelector(".output")

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
}

listen(state.expr1)
listen(state.expr2)

form.onsubmit = event => {
	const { expr1, expr2 } = state
	event.preventDefault()
	validate(expr1)
	validate(expr2)
	if (expr1.token instanceof Error || expr2.token instanceof Error) {
		return
	}
	if (equals(expr1.token, expr2.token)) {
		outputbox.classList.remove("-incorrect")
		outputbox.classList.add("-correct", "-result")
		output.innerHTML = expr1.input.value + " = " + expr2.input.value
	} else {
		outputbox.classList.remove("-correct")
		outputbox.classList.add("-incorrect", "-result")
		output.innerHTML = expr1.input.value + " &NotEqual; " + expr2.input.value
	}
}

function listen(expr) {
	const { input, error } = expr
	const clear = _ => error.innerText = ""
	input.onblur = _ => validate(expr)
	input.onkeypress = clear
	input.onpaste = clear
	input.oninput = clear
}

function validate(expr) {
	const { input, error } = expr
	if (!input.value) {
		expr.token = ""
	} else try {
		expr.token = parse(input.value)
	} catch (err) {
		expr.token = err
	}
	if (expr.token && !(expr.token instanceof Error)
	&& id(expr.token).length > Math.pow(2, 8)
	) {
		expr.token = new Error("Maximum number of vars is 8")
	}
	if (expr.token instanceof Error) {
		error.innerHTML = "&times; " + colonslice(expr.token.message)
	} else {
		error.innerText = ""
	}
}

function colonslice(str) {
	for (var i = str.length; i;) {
		if (str[--i] === ":") break
	}
	if (!i) return str
	return str.slice(i + 2, str.length)
}

let year = document.querySelector("#year")
year.innerText = new Date().getFullYear()
