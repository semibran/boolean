let form = document.querySelector(".form")
let input1 = document.querySelector("#expr1")
let input2 = document.querySelector("#expr2")

form.onsubmit = event => {
	console.log(input1.value, input2.value)
	event.preventDefault()
}
