const press = require("./press.js")
const fs = require('node:fs')
const readline = require('node:readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let text = fs.readFileSync("./dio.press", "utf8")
let rooms = press.parse_rooms(text)

function printroom(roomname) {
    console.log()
    let {text, options} = press.parse_room(rooms, roomname)
    console.log(text.trim())
    for (let i = 0; i < options.length; i++) {
        console.log(`[${i+1}] ${options[i].text}`)
    }
    rl.question(`[?] `, num => {
        printroom(options[num-1].dest)
    });
}

printroom("Start")