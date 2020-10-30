const debug = false

// parse(str) -> expr
// > Parses a string into a boolean expression.
// > A boolean expression is a token tree,
// > eg. [ not|and|or, x, y? ]
module.exports = function parse(str) {
	let stack = []
	for (let i = 0; i < str.length; i++) {
		let chr = str[i]
		if (chr === " ") continue
		if (debug) console.log(chr, stack)
		let node = stack[stack.length - 1]
		let parent = stack[stack.length - 2]
		if (!node && chr !== "(" && chr !== ")") {
			// first pass
			// all operators invalid, so throw if we find one
			if (chr === "'") {
				throw new Error("Failed to parse boolean expression " + str
					+ ": Cannot NOT an undefined clause")
			}
			if (chr === "+") {
				throw new Error("Failed to parse boolean expression " + str
					+ ": Cannot OR an undefined clause")
			}
			// this var is our token for now in case we terminate here
			stack.push(chr)
			continue
		}

		if (chr === "(") {
			if (!node) {
				// start a new group
				let grp = [ "grp" ]
				stack.push(grp)
			} else if (node[0] === "grp" && node.length === 1
				|| node[0] === "or" && node.length === 2
				) {
				// same procedure for nested groups and OR clauses
				let grp = [ "grp" ]
				stack.push(grp)
				node.push(grp)
			} else {
				// AND clause with a group in form x(y)
				let grp = [ "grp" ]
				let and = [ "and", node, grp ]
				stack[stack.length - 1] = and
				stack.push(grp)
				if (parent) parent[parent.length - 1] = and
			}
			continue
		}

		if (chr === ")") {
			// find closest open paren
			let token = null
			while (stack.length && (!token || token[0] !== "grp")) {
				token = stack.pop()
			}
			if (!token || token[0] !== "grp") {
				throw new Error("Failed to parse boolean expression " + str
					+ ": Cannot terminate an undefined clause")
			}
			if (!token[1]) {
				throw new Error("Failed to parse boolean expression " + str
					+ ": Cannot parse an empty group")
			}
			// replace with contents
			if (debug) console.log("ended group", token)
			stack.push(token[1])
			parent = stack[stack.length - 2]
			if (parent) parent[parent.length - 1] = token[1]
			continue
		}

		if (chr === "'") {
			// create token: NOT inverse of most recent var
			// replace var with inverse in stack
			// replace var with inverse in parent if existent
			// point to NOT node
			if (node[0] === "or" && node.length === 2) {
				throw new Error("Failed to parse boolean expression " + str
					+ ": Cannot NOT an incomplete OR clause")
			}
			if (node[0] === "grp") {
				throw new Error("Failed to parse boolean expression " + str
					+ ": Cannot NOT an lparen")
			}
			let not = [ "not", node ]
			stack[stack.length - 1] = not
			if (parent) parent[parent.length - 1] = not
			continue
		}

		if (chr === "+") {
			// create token: OR with highest level non-grouped parent
			// point to OR node
			if (node[0] === "or" && node.length === 2) {
				throw new Error("Failed to parse boolean expression " + str
					+ ": Cannot OR an incomplete OR clause")
			}
			let parent = null
			let group = null
			let i = stack.length
			while (i) {
				parent = stack[--i]
				if (parent[0] === "grp") {
					group = parent
					parent = parent[1]
					break
				}
			}
			let or = [ "or", parent ]
			// prevent overwriting grouped nodes
			// elsewise rparen will lock
			if (!group) {
				stack.length = i
				stack.push(or)
			} else {
				stack.length = i + 1
				stack.push(or)
				group[group.length - 1] = or
			}
			continue
		}

		// -- if we reach this point, chr is another token

		// complete OR node if it holds the form (or x [nil])
		if (node[0] === "or" && node.length === 2) {
			node.push(chr)
			stack.push(chr)
			continue
		}

		// complete GRP node if it holds the form (grp [nil])
		// otherwise, we'll need to AND the current token
		if (node[0] === "grp" && node.length === 1) {
			node.push(chr)
			stack.push(chr)
			continue
		}

		// create token: AND with prev and current tokens
		// point to current token (not AND node)
		let and = [ "and", node, chr ]
		stack[stack.length - 1] = and
		stack.push(chr)
		if (parent) parent[parent.length - 1] = and
	}

	let token = stack[0]
	if (token[0] === "or" && token.length === 2) {
		throw new Error("Failed to parse boolean expression " + str
			+ ": Incomplete OR clause")
	}
	if (token[0] === "grp" || stack[stack.length - 1][0] === "grp") {
		throw new Error("Failed to parse boolean expression " + str
			+ ": Unterminated group")
	}

	return token
}
