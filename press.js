let press = {};
(function () {
    press.variables = {}
    press.functions = {
        hello: args => {
            console.log("hello world,", args)
        }
    }

    press.script = ""
    press.room = ""

    press.parse_rooms = function (dialog) {
        let rooms = {}
        let current_room = ""
        let room_text = ""
        for (let line of dialog.split("\n")) {
            if (line.startsWith("##")) {
                if (current_room !== "") {
                    rooms[current_room] = room_text
                }
                current_room = line.replace(/^##(\s+)?/, "")
                room_text = ""
            } else if (line.startsWith("#")) {
                press.script = line.replace(/^#(\s+)?/, "")
            } else {
                room_text += line + "\n"
            }
        }
        rooms[current_room] = room_text
        return rooms
    }

    function validvar(name) {
        return name.match(/^[\w\d\.\$]+$/)
    }

    function dialog_math(line) {
        let [_, outputvar, expression] = line.match(/^=([\w\d\.\$]+) (.+)$/)
        let tokens = []
        let current_token = ""
        let operators = {
            "+": 0,
            "-": 0,
            "*": 0,
            "/": 0,
            "%": 0,
            "==": 0,
            "!=": 0,
            "&&": 0,
            "||": 0,
            "<=": 0,
            ">=": 0,
            "<": 0,
            ">": 0,
            "!": 0,
        }
        for (let char of expression) {

        }
    }

    press.parse_room = function (rooms, room) {
        press.room = room
        let line_index = 0
        if (!(press.room in rooms)) {
            console.log(room, "isnt a real room???")
            return { text: "", options: [] }
        }
        let lines = rooms[room].split("\n")

        let output = ""
        let options = []

        while (line_index < lines.length) {
            let line = lines[line_index]
            line_index++
            let invert = false
            switch (line[0]) {
                // case ";":
                //     continue
                case "!":
                    invert = true
                case "?":
                    let [_, varname, rest] = line.match(/^[\?\!]([\w\d\.\$]+) (.*)$/)
                    let condition = press.variables[varname] != 0 && press.variables[varname] !== undefined
                    if (invert) {
                        condition = !condition
                    }
                    if (condition) {
                        line = rest
                    } else {
                        continue
                    }
                    break
            }

            let setvar = 0
            switch (line[0]) {
                case ";":
                    continue
                case "+":
                    setvar = 1
                case "-":
                    press.variables[line.slice(1)] = setvar
                    break
                case "=":
                    break
                    dialog_math(line)
                    break
                case ">":
                    let jumproom = line.slice(1)
                    press.room = jumproom
                    if (!(press.room in rooms)) {
                        console.log(room, "isnt a real room???")
                        return { text: "", options: [] }
                    }
                    line_index = 0
                    lines = rooms[jumproom].split("\n")
                    break
                case "[":
                    let [_, dest, text] = line.match(/^\[(.+)\] (.+)$/)
                    options.push({ text, dest })
                    break
                case "%":
                    let [__, func, args] = line.match(/^%([\w\d]+) (.*)/)
                    if (func in press.functions) {
                        press.functions[func](args, press.script)
                    } else {
                        console.log(func, "is NOT a function blud")
                    }
                    break
                case "\\":
                    line = line.slice(1)
                default:
                    output += line + "\n"
            }
        }

        return { text: output, options }
    }
})()

module.exports = press