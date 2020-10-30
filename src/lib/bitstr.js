const fnify = require("./fn")

module.exports = function bitstr(token) {
	let bits = ""
	let fn = fnify(token)
	let perms = Math.pow(2, fn.length)
	for (let i = 0; i < perms; i++) {
		let str = i.toString(2)
		while (str.length < fn.length) {
			str = "0" + str
		}
		let argv = str.split("").map(Number)
		bits += Number(fn(...argv))
	}
	return bits
}
