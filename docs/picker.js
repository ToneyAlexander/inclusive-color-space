const square = document.getElementById("color-square");
const cursor = document.getElementById("square-cursor");
const slider = document.getElementById("slider");
const face = document.getElementById("face");
const hexText = document.getElementById("hex");

const r2Picker = document.getElementById("r-squared")
const spherePicker = document.getElementById("show-sphere")

////// Canvas Setup
const w = square.width || square.clientWidth;
const h = square.height || square.clientHeight;

const canvas = document.createElement("canvas");
canvas.width = w;
canvas.height = h;

const ctx = canvas.getContext("2d", { willReadFrequently: true });
const img = ctx.createImageData(w, h);
//////

let radius_squared = r2Picker.value
let radius = Math.sqrt(radius_squared)

let showSphere = spherePicker.checked

let t_value = 0; //y (deep vs fair)
let u_value = 0; //x (flushed vs ochre)
let v_value = 0; //slider (cool vs warm)

let stored_x = 150
let stored_y = 150
let stored_z = 0

function tuvToRgb(t, u, v) {
    x = (t - 0.15) / 0.45
    y = (v - 1.2 * t ** 2 + 0.2 * t + 0.655) / 1.84
    z = u / 3.6

    r = 28.77438370854 * x + 36.78307445559 * y - 19.69766918644 * z + 187.1436241611
    g = 35.38327306318 * x - 2.009931981182 * y + 47.93462563172 * z + 137.1073825503
    b = 36.14733717939 * x - 43.54346996173 * y - 28.50821294135 * z + 108.2241610738

    return {
        r: Math.trunc(r),
        g: Math.trunc(g),
        b: Math.trunc(b)
    };
}

function rgbToHex(r, g, b) {
    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))

    return "#" + [r, g, b]
        .map(v => v.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
}

function setColor(hex) {
    face.style.background = hex;
    hexText.textContent = hex;

    updateSquareBackground();
    updateBrightnessSlider();
}

function updateBrightnessSlider() {
    const stops = [];

    for (let v = -radius; v <= radius; v += .2) {
        const rgb = tuvToRgb(t_value, u_value, v);

        stops.push(
            `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        );
    }

    const gradient =
        `linear-gradient(to right, ${stops.join(",")})`;

    slider.style.background = gradient;
}

function updateSquareBackground() {
    for (let y = 0; y < h; y++) {

        let t = radius * (2 * y - h) / h

        for (let x = 0; x < w; x++) {
            let u = radius * (2 * x - w) / w

            let alpha = 255
            if (showSphere && Math.sqrt(t ** 2 + u ** 2 + v_value ** 2) >= radius) {
                alpha = 192
            }

            const rgb = tuvToRgb(t, u, v_value);

            const i = (y * w + x) * 4;

            img.data[i] = rgb.r;
            img.data[i + 1] = rgb.g;
            img.data[i + 2] = rgb.b;
            img.data[i + 3] = alpha;
        }
    }

    ctx.putImageData(img, 0, 0);

    square.style.backgroundImage =
        `url(${canvas.toDataURL()})`;
}

let dragging = false;

function setFromMouse(e) {
    const rect = square.getBoundingClientRect();

    const x = Math.max(0,
        Math.min(e.clientX - rect.left, rect.width - 3));

    const y = Math.max(0,
        Math.min(e.clientY - rect.top, rect.height - 3));

    stored_x = x
    stored_y = y
    setFromXY(x, y)
}

function setFromXY(x, y) {
    var p = ctx.getImageData(x, y, 1, 1).data;

    t_value = radius * (2 * y - h) / h
    u_value = radius * (2 * x - w) / w

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    setColor(rgbToHex(p[0], p[1], p[2]))
}

square.addEventListener("mousedown", e => {
    dragging = true;
    setFromMouse(e);
});

window.addEventListener("mousemove", e => {
    if (dragging) setFromMouse(e);
});

window.addEventListener("mouseup", () => {
    dragging = false;
});

slider.addEventListener("input", () => {
    v_value = Number(slider.value) * radius;
    let o = tuvToRgb(t_value, u_value, v_value)
    setColor(rgbToHex(o.r, o.g, o.b));
});

r2Picker.addEventListener("input", () => {
    radius_squared = r2Picker.value
    radius = Math.sqrt(radius_squared)
    v_value = Number(slider.value) * radius

    showSphere = spherePicker.checked

    setFromXY(stored_x, stored_y)
})
spherePicker.addEventListener("change", () => {
    showSphere = spherePicker.checked
    updateSquareBackground()
})

function refreshUI() {
    cursor.style.left = "150px";
    cursor.style.top = "150px";

    t_value = 0; //y (deep vs fair)
    u_value = 0; //x (flushed vs ochre)
    v_value = 0; //slider (cool vs warm)

    radius_squared = r2Picker.value
    radius = Math.sqrt(radius_squared)

    showSphere = spherePicker.checked

    let o = tuvToRgb(t_value, u_value, v_value)
    setColor(rgbToHex(o.r, o.g, o.b));
}

refreshUI()