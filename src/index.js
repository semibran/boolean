import parse from "./lib/parse"
import id from "./lib/bitstr"

let form = document.querySelector(".form")
let input1 = document.querySelector("#expr1")
let input2 = document.querySelector("#expr2")

form.onsubmit = event => {
	let token1 = parse(input1.value)
	let token2 = parse(input2.value)
	let id1 = id(token1)
	let id2 = id(token2)
	console.log(id1, id2)
	event.preventDefault()
}
