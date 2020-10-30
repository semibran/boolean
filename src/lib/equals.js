const args = require("./args")
const bitstr = require("./bitstr")

module.exports = function equals(token1, token2) {
	let args1 = args(token1)
	let args2 = args(token2)
	while (args1.length < args2.length) {
		let arg = args2.find(arg => !args1.includes(arg))
		token1 = addarg(token1, arg)
		args1.push(arg)
	}
	while (args2.length < args1.length) {
		let arg = args1.find(arg => !args2.includes(arg))
		token2 = addarg(token2, arg)
		args2.push(arg)
	}
	return parseInt(bitstr(token1), 2) === parseInt(bitstr(token2), 2)
}

function addarg(token, arg) {
	return [ "and", [ "or", 1, arg ], token ]
}
