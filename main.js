'use strict'

let DEBUG = false

const grid_size = 20
const width = mg.width / grid_size
const height = mg.height / grid_size

function vector(x, y) {
    return { x, y }
}
function vecadd(a, b) {
    return vector(a.x + b.x, a.y + b.y)
}
function vecsub(a, b) {
    return vector(a.x - b.x, a.y - b.y)
}
function vecfloor(a) {
    return vector(Math.floor(a.x), Math.floor(a.y))
}
function veceq(a, b) {
    return a.x == b.x && a.y == b.y
}

let direction = vector(1, 0)
let dircooldown = 0
let snake = [{ pos: vector(1, 1), dir: direction }]

let foods = []

function makeFood(pos, type) {
    return { pos, type }
}
function spawnPizza() {
    let pos = vector(Math.random() * (width - 1), Math.random() * (height - 1))
    foods.push(makeFood(vecadd(vecfloor(pos), vector(0, 0)), "pizza_tl"))
    foods.push(makeFood(vecadd(vecfloor(pos), vector(1, 0)), "pizza_tr"))
    foods.push(makeFood(vecadd(vecfloor(pos), vector(0, 1)), "pizza_bl"))
    foods.push(makeFood(vecadd(vecfloor(pos), vector(1, 1)), "pizza_br"))
}
function spawnFood() {
    let pos = vector(Math.random() * (width), Math.random() * (height))
    let type = "apple"
    switch (Math.floor(Math.random() * 3)) {
        case 0:
            spawnPizza()
            return
        case 1:
            type = "apple"
            break
        case 2:
            type = "scone"
            break
        default:
    }
    foods.push({ pos: vecfloor(pos), type })

}

let assets = {}
function preload() {
    assets.pizza_tl = mg.load_image("assets/pizza_tl.png")
    assets.pizza_tr = mg.load_image("assets/pizza_tr.png")
    assets.pizza_bl = mg.load_image("assets/pizza_bl.png")
    assets.pizza_br = mg.load_image("assets/pizza_br.png")
    assets.apple = mg.load_image("assets/apple.png")
    assets.scone = mg.load_image("assets/scone.png")
}

function load() {
    spawnFood()
}

let frame = 0
let speed = 10

let flipcooldown = 0

let STATE = "playing"

function loop() {
    if (STATE == "playing") {
        mg.clear_screen(0, 0, 0)
        frame++
        if (dircooldown > 0) dircooldown--
        if (flipcooldown > 0) flipcooldown--

        if (dircooldown == 0) {
            let flipped = false
            let moved = false
            let headdir = snake[snake.length - 1].dir
            if (mg.isKeyDown("KeyW")) {
                let dir = vector(0, -1)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyDown("KeyS")) {
                let dir = vector(0, 1)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyDown("KeyA")) {
                let dir = vector(-1, 0)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyDown("KeyD")) {
                let dir = vector(1, 0)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }

            if (flipped && flipcooldown == 0) {
                flipcooldown = 30
                direction = vecsub(vector(0, 0), snake[0].dir)
                snake.reverse()
                for (let segment of snake) {
                    segment.dir = vecsub(vector(0, 0), segment.dir)
                }
            }
            if (moved) {
                dircooldown = speed
            }
        }

        let ateFood = false
        if (frame > speed) {
            frame = 0
            let newPos = vecadd(snake[snake.length - 1].pos, direction)
            if (newPos.x < 0) newPos.x = width - 1
            if (newPos.x >= width) newPos.x = 0
            if (newPos.y < 0) newPos.y = height - 1
            if (newPos.y >= height) newPos.y = 0
            snake[snake.length-1].dir = direction
            snake.push({ pos: newPos, dir: direction })

            let lastSegment = snake[snake.length - 1]
            for (let i = foods.length - 1; i >= 0; i--) {
                if (veceq(foods[i].pos, lastSegment.pos)) {
                    if (foods[i].type == "scone") {
                        speed -= 2
                        setTimeout(() => { speed += 2 }, 10000)
                    }
                    foods.splice(i, 1)
                    ateFood = true
                    if (foods.length == 0) {
                        spawnFood()
                    }
                }
            }


            if (!ateFood) {
                snake.shift()
            }

            for (let i = 0; i < snake.length - 2; i++) {
                if (veceq(snake[i].pos, lastSegment.pos)) {
                    STATE = "game over"
                }
            }
        }


        let size = grid_size / 2
        for (let segment of snake) {
            mg.set_fill_color(0, 255, 0)

            mg.filled_rect(segment.pos.x * grid_size + (grid_size / 2 - size / 2), segment.pos.y * grid_size + (grid_size / 2 - size / 2), size, size)
            if (DEBUG) {
            mg.set_fill_color(255,0,0)
            mg.filled_rect(segment.pos.x * grid_size + grid_size/2, segment.pos.y * grid_size + grid_size/2, segment.dir.x*grid_size/2+2, segment.dir.y*grid_size/2+2)
            }
            size += grid_size / (snake.length + 2)
            size = Math.min(size, grid_size - 2)
        }
        mg.set_fill_color(0, 128, 0)
        let lastSegment = snake[snake.length - 1]
        mg.filled_rect(lastSegment.pos.x * grid_size, lastSegment.pos.y * grid_size, grid_size, grid_size)



        for (let food of foods) {
            mg.draw_image(assets[food.type], food.pos.x * grid_size, food.pos.y * grid_size)
        }
    }

    mg.set_fill_color(255, 255, 255)
    mg.draw_text(dircooldown, 0, 50)
}

mg.start()