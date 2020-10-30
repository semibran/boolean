const reduceargs = require("./args")

module.exports = function fnify(token) {
	let str = strify(token)
	let args = reduceargs(token)
	return eval("(" + args.join(",") + ")=>" + str)
}

function strify(token, parent) {
	if (!Array.isArray(token)) return token
	let [ type, x, y ] = token
	if (type === "not") {
		return "!" + strify(x, type)
	}
	if (type === "and") {
		let and = strify(x, type) + "&&" + strify(y, type)
		if (parent === "not") {
			return `(${ and })`
		} else {
			return and
		}
	}
	if (type === "or") {
		let or = strify(x, type) + "||" + strify(y, type)
		if (parent === "not" || parent === "and") {
			return `(${ or })`
		} else {
			return or
		}
	}
}
