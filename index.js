let form = document.querySelector(".form")
let input = document.querySelector(".input")

form.onsubmit = event => {
	console.log(input.value)
	event.preventDefault()
}
