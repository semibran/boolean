import parse from "./lib/parse"
import id from "./lib/bitstr"

const form = document.querySelector(".section.-form")
const input1 = document.querySelector("#expr1")
const input2 = document.querySelector("#expr2")
const error1 = document.querySelector(".input-error.-expr1")
const error2 = document.querySelector(".input-error.-expr2")
const outputbox = document.querySelector(".output-box")
const output = document.querySelector(".output")

let token1 = null
let token2 = null

input1.onkeypress = input1.onpaste = input1.oninput = _ => error1.innerText = ""
input2.onkeypress = input2.onpaste = input2.oninput = _ => error2.innerText = ""
input1.onblur = updateInput1
input2.onblur = updateInput2

form.onsubmit = event => {
	event.preventDefault()
	updateInput1()
	updateInput2()
	if (token1 instanceof Error || token2 instanceof Error) return
	let id1 = id(token1)
	let id2 = id(token2)
	if (id1 === id2) {
		outputbox.classList.remove("-incorrect")
		outputbox.classList.add("-correct", "-result")
		output.innerHTML = input1.value + " = " + input2.value
	} else {
		outputbox.classList.remove("-correct")
		outputbox.classList.add("-incorrect", "-result")
		output.innerHTML = input1.value + " &NotEqual; " + input2.value
	}
}

function updateInput1() {
	if (!input1.value) {
		token1 = ""
	} else {
		try {
			token1 = parse(input1.value)
		} catch (err) {
			token1 = err
		}
	}
	if (token1 instanceof Error) {
		error1.innerText = colonslice(token1.message)
	} else {
		error1.innerText = ""
	}
}

function updateInput2() {
	if (!input2.value) {
		token2 = ""
	} else {
		try {
			token2 = parse(input2.value)
		} catch (err) {
			token2 = err
		}
	}
	if (token2 instanceof Error) {
		error2.innerText = colonslice(token2.message)
	} else {
		error2.innerText = ""
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
