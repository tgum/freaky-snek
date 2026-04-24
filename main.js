// i reccomend you skip reading this code
// unless you hate yourself
// there is literally ZERO organization
// its just everything plonked into one file
// i didnt even try to make it okay

let DEBUG = false

const grid_size = 20
const width = mg.width / grid_size
const height = mg.height / grid_size

function vector(x=0, y=0) {
    return { x, y }
}
function vecadd(a, b) {
    return vector(a.x + b.x, a.y + b.y)
}
function vecsub(a, b) {
    return vector(a.x - b.x, a.y - b.y)
}
function vecmul(a, b) {
    return vector(a.x * b, a.y * b)
}
function vecfloor(a) {
    return vector(Math.floor(a.x), Math.floor(a.y))
}
function vecround(a) {
    return vector(Math.round(a.x), Math.round(a.y))
}
function veceq(a, b) {
    return a.x == b.x && a.y == b.y
}
function veccopy(a) {
    return vector(a.x, a.y)
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
let foodPool = {
    apple: 300,
    pizza: 100,
    scone: 100,
    chicken: 30,
    cat: 50,
    gay: 50,
    snail: 0.1,
    heart: 10
}
function spawnFood() {
    let pos = vector(Math.random() * (width - 1), Math.random() * (height - 1))
    let type = "apple"

    let total = 0
    for (let key in foodPool) {
        total += foodPool[key]
    }
    console.log(total)
    let chance = Math.random() * total
    let sum = 0
    for (let key in foodPool) {
        sum += foodPool[key]
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
        case "chicken":
            spawnFood()
            spawnChicken()
            break
        case "cat":
            spawnFood()
            spawnCat()
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
    if (snail.alive) return
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
let chicken = {
    pos: vector(0, 0),
    alive: false,
    dir: vector(0, 0),
    frame: 0
}
function spawnChicken() {
    if (chicken.alive) return
    chicken.alive = true
    chicken.pos = vecadd(vecrand(width - 7, height - 7), vector(1, 1))
    chicken.dir = vecsub(vecrand(2, 2), vector(1, 1))
}
let cat = {
    pos: vector(0, 0),
    alive: false,
    timer: 0,
    dir: vector(0, 0),
    angle: 0
}
function spawnCat() {
    cat.alive = true
    let side = Math.floor(Math.random() * 4)
    let lastSegment = snake[snake.length - 1]
    if (side == 0) {
        cat.pos.x = Math.min(lastSegment.pos.x, width - 2)
        cat.pos.y = 0
        cat.dir = vector(0, 1)
        cat.angle = Math.PI / 2
    } else if (side == 1) {
        cat.pos.x = Math.min(lastSegment.pos.x, width - 2)
        cat.pos.y = height - 2
        cat.dir = vector(0, -1)
        cat.angle = -Math.PI / 2
    } else if (side == 2) {
        cat.pos.x = 0
        cat.pos.y = Math.min(lastSegment.pos.y, height - 2)
        cat.dir = vector(1, 0)
        cat.angle = 0
    } else if (side == 3) {
        cat.pos.x = width - 2
        cat.pos.y = Math.min(lastSegment.pos.y, height - 2)
        cat.dir = vector(-1, 0)
        cat.angle = Math.PI
    }
    cat.timer = 0
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
    assets.chicken = mg.load_image("assets/chicken.png")
    assets.chicken_eating = mg.load_image("assets/chicken_eating.png")
    assets.chicken_flipped = mg.load_image("assets/chicken_flipped.png")
    assets.chicken_eating_flipped = mg.load_image("assets/chicken_eating_flipped.png")
    assets.cat_warning = mg.load_image("assets/cat_warning.png")
    assets.cat = mg.load_image("assets/cat.png")
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

let buttons = { up: false, down: false, left: false, right: false, jump: false }
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
let lastjump = 0

function loop(dt) {
    if (STATE == "playing") {
        mg.clear_screen(...background_color)
        frame++
        lastjump++
        if (dircooldown > 0) dircooldown--
        if (flipcooldown > 0) flipcooldown--

        if (chicken.alive && Math.random() < 0.005 && !cat.alive) {
            spawnCat()
        }

        if (dircooldown == 0) {
            let flipped = false
            let moved = false
            let headdir = snake[snake.length - 1].dir
            if (mg.isKeyJustDown("KeyW") || mg.isKeyJustDown("ArrowUp") || buttons.up) {
                let dir = vector(0, -1)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyJustDown("KeyS") || mg.isKeyJustDown("ArrowDown") || buttons.down) {
                let dir = vector(0, 1)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyJustDown("KeyA") || mg.isKeyJustDown("ArrowLeft") || buttons.left) {
                let dir = vector(-1, 0)
                if (veceq(headdir, vecsub(vector(0, 0), dir))) {
                    flipped = true
                } else direction = dir
                moved = true
            }
            if (mg.isKeyJustDown("KeyD") || mg.isKeyJustDown("ArrowRight") || buttons.right) {
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

        if (mg.isKeyJustDown("Space") || buttons.jump) {
            if (headheight == 0 && canjump) {
                canjump = false
                headheight = 1
                setTimeout(() => { headheight = 0 }, dt * speed * 3)
                setTimeout(() => { canjump = true }, 3000)
            }
            if (lastjump < 20) {
                console.log("doublejump!")
            }
            lastjump = 0
        }

        if (mg.isKeyJustDown("KeyG") || buttons.up) {
            cheatsequence += "g"
        }
        if (mg.isKeyJustDown("KeyU") || buttons.down) {
            cheatsequence += "u"
        }
        if (mg.isKeyJustDown("KeyS") || buttons.left) {
            cheatsequence += "s"
        }
        if (mg.isKeyJustDown("KeyY") || buttons.right) {
            cheatsequence += "y"
            if (cheatsequence.endsWith("gussy")) {
                speed += 4
                console.log("cheatcode :D")
            }
        }

        if (chicken.alive) {
            chicken.pos = vecadd(chicken.pos, vecmul(chicken.dir, 0.05))
            if (chicken.pos.x < 0 || chicken.pos.x >= width - 5.1) {
                chicken.dir.x *= -Math.random()
            }
            if (chicken.pos.y < 0 || chicken.pos.y > height - 5) {
                chicken.dir.y *= -Math.random()
            }
            chicken.pos = vecadd(chicken.pos, vecmul(chicken.dir, 0.05))
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
                mg.set_fill_color(...HSVtoRGB(i / snake.length, 0.9, 1))
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
        if (chicken.alive) {
            let x = 9
            if (chicken.dir.x > 0) x = 91
            let beakpos = vecfloor(vecadd(chicken.pos, vector(x / grid_size, 48 / grid_size)))
            if (veceq(beakpos, snake[snake.length - 1].pos)) {
                STATE = "game over"
                deathreason = "eated by chicken"
            }

            chicken.frame++
            chicken.frame = chicken.frame % 16
            let img = "chicken"
            if (chicken.frame >= 8) img += "_eating"
            if (chicken.dir.x > 0) img += "_flipped"
            mg.draw_image(assets[img], chicken.pos.x * grid_size, chicken.pos.y * grid_size)
        }
        if (cat.alive) {
            cat.timer++
            mg.ctx.save()
            mg.ctx.translate(cat.pos.x * grid_size + 20, cat.pos.y * grid_size + 20)
            mg.ctx.rotate(cat.angle)
            if (cat.timer < 60 * 2) {
                mg.draw_image(assets.cat_warning, -20, -20)
            } else {
                mg.draw_image(assets.cat, -20, -20)
                cat.pos = vecadd(cat.pos, vecmul(cat.dir, 0.5))

                let catmouth = vecadd(cat.pos, cat.dir)
                let catmouth2 = veccopy(catmouth)
                if (cat.dir.x == 0) {
                    catmouth2.x++
                } else {
                    catmouth2.y++
                }

                let highest_segment = -1
                for (let i = 0; i < snake.length; i++) {
                    let segment = snake[i]
                    if (veceq(catmouth, segment.pos) || veceq(catmouth2, segment.pos) && segment.height == 0) {
                        if (i == snake.length - 1) {
                            STATE = "game over"
                            deathreason = "nommed by cat :3"
                        }
                        highest_segment = i
                    }
                }
                if (highest_segment >= 0) {
                    snake = snake.slice(highest_segment)
                }
                for (let i = foods.length - 1; i >= 0; i--) {
                    if (veceq(catmouth, foods[i].pos) || veceq(catmouth2, foods[i].pos)) {
                        foods.splice(i)
                        if (foods.length == 0) {
                            spawnFood()
                            break
                        }
                    }
                }

                if (chicken.alive) {
                    let collided = (catmouth.x <= chicken.pos.x + 5 && catmouth2.x + 1 >= chicken.pos.x) &&
                        (catmouth.y <= chicken.pos.y + 5 && catmouth2.y + 1 >= chicken.pos.y)
                    if (collided) {
                        chicken.alive = false
                    }
                }

                if (cat.pos.x < -2 || cat.pos.x > width || cat.pos.y < -2 || cat.pos.y > height) {
                    cat.alive = false
                }
            }
            mg.ctx.restore()
        }
        for (let key in buttons) {
            buttons[key] = false
        }
    }

    mg.set_fill_color(255, 255, 255)
    mg.draw_text(Math.floor(1000 / dt), 0, 20)
}

mg.start()