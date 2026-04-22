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
function vecrand(maxx, maxy) {
    return vector(Math.random() * maxx, Math.random() * maxy)
}

function HSVtoRGB(h, s, v) {
    // https://stackoverflow.com/a/17243070
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}


let direction = vector(1, 0)
let dircooldown = 0
let headheight = 0
let snake = [{ pos: vector(1, 1), dir: direction, height: headheight }]

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
    let pos = vector(Math.random() * (width - 1), Math.random() * (height - 1))
    let type = "apple"
    let pool = {
        apple: 300,
        pizza: 100,
        scone: 100,
        gay: 50,
        snail: 0.1,
        heart: 10
    }
    let total = 0
    for (let key in pool) {
        total += pool[key]
    }
    console.log(total)
    let chance = Math.random() * total
    let sum = 0
    for (let key in pool) {
        sum += pool[key]
        if (chance < sum) {
            type = key
            break
        }
    }
    switch (type) {
        case "pizza":
            spawnPizza()
            break
        case "snail":
            spawnFood()
            spawnSnail()
            break
        case "heart":
        default:
            foods.push({ pos: vecfloor(pos), type })
    }
}

let snail = {
    pos: vector(0, 0),
    alive: false
}
function spawnSnail() {
    snail.alive = true
    let diff = false
    while (!diff) {
        snail.pos = vecfloor(vecrand(width, height))
        for (let segment of snake) {
            if (!veceq(snail.pos, segment.pos)) {
                diff = true
                break
            }
        }
    }
}

let assets = {}
function preload() {
    assets.pizza_tl = mg.load_image("assets/pizza_tl.png")
    assets.pizza_tr = mg.load_image("assets/pizza_tr.png")
    assets.pizza_bl = mg.load_image("assets/pizza_bl.png")
    assets.pizza_br = mg.load_image("assets/pizza_br.png")
    assets.apple = mg.load_image("assets/apple.png")
    assets.scone = mg.load_image("assets/scone.png")
    assets.gay = mg.load_image("assets/gay.png")
    assets.snail = mg.load_image("assets/snail.png")
    assets.heart = mg.load_image("assets/heart.png")
}

function load() {
    resetVariables()
    spawnFood()
}

function resetVariables() {
    press.variables = {}
    frame = 0
    speed = 10
    flipcooldown = 0
    STATE = "playing"
    deathreason = ""
    background_color = [0, 0, 0]
    gay = 0
    cheatsequence = ""
    slowdown = 0
    canjump = true
    dircooldown = 0
    headheight = 0
    snake = [{ pos: vector(1, 1), dir: direction, height: headheight }]

    foods = []
}

let buttons = { up: false, down: false, left: false, right: false }
for (let button of Object.keys(buttons)) {
    let elt = document.getElementById(button)
    elt.addEventListener("pointerdown", () => {
        buttons[button] = true
    })
}

let frame = 0
let speed = 10

let flipcooldown = 0

let STATE = "playing"
let deathreason = ""

let background_color = [0, 0, 0]

let gay = 0
let cheatsequence = ""
let slowdown = 0
let canjump = true

function loop() {
    if (STATE == "playing") {
        mg.clear_screen(...background_color)
        frame++
        if (dircooldown > 0) dircooldown--
        if (flipcooldown > 0) flipcooldown--

        if (dircooldown == 0) {
            let flipped = false
            let moved = false
            let headdir = snake[snake.length - 1].dir
            if (mg.isKeyDown("KeyW") || mg.isKeyDown("ArrowUp") || buttons.up) {
                buttons.up = false
                let dir = vector(0, -1)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyDown("KeyS") || mg.isKeyDown("ArrowDown") || buttons.down) {
                buttons.down = false
                let dir = vector(0, 1)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyDown("KeyA") || mg.isKeyDown("ArrowLeft") || buttons.left) {
                buttons.left = false
                let dir = vector(-1, 0)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyDown("KeyD") || mg.isKeyDown("ArrowRight") || buttons.right) {
                buttons.right = false
                let dir = vector(1, 0)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }

            if (flipped && flipcooldown == 0) {
                flipcooldown = 15
                direction = vecsub(vector(0, 0), snake[0].dir)
                snake.reverse()
                for (let segment of snake) {
                    segment.dir = vecsub(vector(0, 0), segment.dir)
                }
            }
            if (moved) {
                dircooldown = speed / 2
            }
        }

        if (mg.isKeyDown("Space") && headheight == 0 && canjump) {
            canjump = false
            headheight = 1
            setTimeout(() => { headheight = 0 }, 300)
            setTimeout(() => { canjump = true }, 3000)
        }

        if (mg.isKeyDown("KeyN") && !cheatsequence.endsWith("n")) {
            cheatsequence += "n"
        }
        if (mg.isKeyDown("KeyI") && !cheatsequence.endsWith("i")) {
            cheatsequence += "i"
        }
        if (mg.isKeyDown("KeyA") && !cheatsequence.endsWith("a")) {
            cheatsequence += "a"
            if (cheatsequence.endsWith("nina")) {
                speed += 4
            }
        }

        let ateFood = false
        if (frame > speed + slowdown) {
            frame = 0
            let newPos = vecadd(snake[snake.length - 1].pos, direction)
            let hitside = false
            if (newPos.x < 0) {
                newPos.x = width - 1
                hitside = true
            }
            if (newPos.x >= width) {
                newPos.x = 0
                hitside = true
            }
            if (newPos.y < 0) {
                newPos.y = height - 1
                hitside = true
            }
            if (newPos.y >= height) {
                newPos.y = 0
                hitside = true
            }
            if (hitside && Math.random() < 0.005) {
                background_color = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
            }

            snake[snake.length - 1].dir = direction
            snake.push({ pos: newPos, dir: direction, height: headheight })

            let lastSegment = snake[snake.length - 1]
            for (let i = foods.length - 1; i >= 0; i--) {
                if (veceq(foods[i].pos, lastSegment.pos) && headheight == 0) {
                    if (foods[i].type == "scone") {
                        speed -= 2
                        setTimeout(() => { speed += 2 }, 10000)
                    }
                    if (foods[i].type == "gay") {
                        gay++
                        setTimeout(() => { gay-- }, 10000)
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
                if (veceq(snake[i].pos, lastSegment.pos) && headheight == snake[i].height) {
                    STATE = "game over"
                    deathreason = "u ate urself"
                }
            }
            if (veceq(lastSegment.pos, snail.pos) && snail.alive) {
                if (headheight == 0) {
                    STATE = "game over"
                    deathreason = "snails are poisonus to snakes or something"
                } else {
                    snail.alive = false
                }
            }
        }


        let i = 0
        for (let segment of snake) {
            mg.set_fill_color(0, 255, 0)
            if (gay > 0) {
                mg.set_fill_color(...HSVtoRGB(i / snake.length, 0.7, 1))
            }

            let dsize = Math.floor(i / snake.length * grid_size / 2 + grid_size / 2)
            dsize += segment.height * 6
            mg.filled_rect(segment.pos.x * grid_size + (grid_size / 2 - dsize / 2), segment.pos.y * grid_size + (grid_size / 2 - dsize / 2), dsize, dsize)
            if (DEBUG) {
                mg.set_fill_color(255, 0, 0)
                mg.filled_rect(segment.pos.x * grid_size + grid_size / 2, segment.pos.y * grid_size + grid_size / 2, segment.dir.x * grid_size / 2 + 2, segment.dir.y * grid_size / 2 + 2)
            }
            i++
        }
        mg.set_fill_color(0, 128, 0)
        let lastSegment = snake[snake.length - 1]
        mg.filled_rect(lastSegment.pos.x * grid_size, lastSegment.pos.y * grid_size, grid_size, grid_size)



        for (let food of foods) {
            mg.draw_image(assets[food.type], food.pos.x * grid_size, food.pos.y * grid_size)
        }
        if (snail.alive) {
            mg.draw_image(assets.snail, snail.pos.x * grid_size, snail.pos.y * grid_size)
        }
    }

    mg.set_fill_color(255, 255, 255)
}

mg.start()