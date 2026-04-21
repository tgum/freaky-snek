const mg = {}

mg.width = 640
mg.height = 480
mg.fps = 60

mg.canvas = document.createElement("canvas")
mg.canvas.id = "canvas"
mg.canvas.width = mg.width
mg.canvas.height = mg.height
document.querySelector("#container").appendChild(mg.canvas)
mg.ctx = mg.canvas.getContext("2d")
mg.ctx.imageSmoothingEnabled = false

mg._load_tasks = 0

mg.load_image = function(path) {
  console.log(path)
  let img = new Image()
  img.src = path
  mg._load_tasks++
  img.onload = () => {
    mg._load_tasks--
    console.log("loaded image")
  }
  return img
}
mg.load_sound = function(path) {
  let sound = new Audio(path);
  mg._load_tasks++
  sound.addEventListener("canplaythrough", (event) => {
    mg._load_tasks--
    console.log("loaded audio")
  })
  return sound
}

mg.start = function() {
  mg.scale = mg.canvas.offsetWidth / mg.width

  preload()
  mg._start()
}
mg._start = function() {
  console.log("loading")
  if (mg._load_tasks > 0) {
    setTimeout(() => {
      mg._start()
    }, 10)
    return;
  }
  console.log("loaded")
  if (typeof load === "function") {
    load()
  }
  //setTimeout(mg._loop, 1000/60)
  // window.requestAnimationFrame(mg._loop)
  mg._loop()
}
mg._previousTimeStamp = 0
mg._loop = function(timeStamp) {
  let elapsed = timeStamp - mg._previousTimeStamp
  mg._previousTimeStamp = timeStamp
  if (typeof loop === "function") {
    loop(elapsed)
  }
  setTimeout(mg._loop, 1000/mg.fps)
  //window.requestAnimationFrame(mg._loop)
}

mg.set_fill_color = function(r, g, b) {
  mg.ctx.fillStyle = `rgb(${r} ${g} ${b})`
}
mg.filled_rect = function(x, y, w, h) {
  mg.ctx.fillRect(Math.floor(x), Math.floor(y), w, h)
}
mg.rect = mg.filled_rect

mg.circle = function(x, y, radius) {
  mg.ctx.beginPath()
  mg.ctx.arc(x, y, radius, 0, Math.PI * 2, false)
  mg.ctx.fill()
}

mg.draw_poly = function(points) {
  mg.ctx.beginPath()
  mg.ctx.moveTo(points[0].x, points[0].y)
  for (let point of points) {
    mg.ctx.lineTo(Math.floor(point.x), Math.floor(point.y))

  }
  mg.ctx.closePath()
  mg.ctx.fill()
}

mg.text_style = function(size=10, font="sans-serif") {
  mg.ctx.font = `${size}px ${font}`
}
mg.draw_text = function(text, x, y) {
  mg.ctx.fillText(text, x, y);
}

mg.draw_image = function(image, x, y, scale=1) {
  mg.ctx.drawImage(image, x, y, image.width*scale, image.height*scale)
}
mg.clear_screen = function(r=255, g=255, b=255) {
  mg.ctx.resetTransform()
  mg.set_fill_color(r,g,b)
  mg.filled_rect(0, 0, mg.width, mg.height)
}

mg.keys = {}
document.body.addEventListener("keydown", (event) => {
  mg.keys[event.code] = true
});
document.body.addEventListener("keyup", (event) => {
  mg.keys[event.code] = false
});

mg.isKeyDown = function(key) {
  return !!mg.keys[key]
}

mg.mouse = {x: 0, y: 0, buttons: [false, false, false]}
mg.canvas.addEventListener("mousemove", (event) => {
  mg.scale = mg.canvas.offsetWidth / mg.width
  mg.mouse.x = event.offsetX / mg.scale
  mg.mouse.y = event.offsetY / mg.scale
});
document.body.addEventListener("mousedown", e => {
  mg.mouse.buttons[e.button] = true
})
document.body.addEventListener("mouseup", e => {
  mg.mouse.buttons[e.button] = false
})
