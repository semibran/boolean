import parse from "./lib/parse"
import id from "./lib/bitstr"

let form = document.querySelector(".section.-form")
let input1 = document.querySelector("#expr1")
let input2 = document.querySelector("#expr2")
let outputbox = document.querySelector(".output-box")
let output = document.querySelector(".output")

form.onsubmit = event => {
	event.preventDefault()
	let expr1 = input1.value
	let expr2 = input2.value
	let token1 = null
	let token2 = null
	try {
		token1 = parse(expr1)
	} catch (err) {
		return console.log(colonslice(err.message))
	}
	try {
		token2 = parse(expr2)
	} catch (err) {
		return console.log(colonslice(err.message))
	}
	let id1 = id(token1)
	let id2 = id(token2)
	if (id1 === id2) {
		outputbox.classList.remove("-incorrect")
		outputbox.classList.add("-correct", "-result")
		output.innerHTML = expr1 + " = " + expr2
	} else {
		outputbox.classList.remove("-correct")
		outputbox.classList.add("-incorrect", "-result")
		output.innerHTML = expr1 + " &NotEqual; " + expr2
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
