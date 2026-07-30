const cvs = document.getElementById("background-grid");
const cx = cvs.getContext("2d");

const headerFaces = document.getElementById("header-faces");

const p1 = document.getElementById("table-1");
const p2 = document.getElementById("table-2");
const p3 = document.getElementById("table-3");
const p4 = document.getElementById("table-4");
const p5 = document.getElementById("table-5");
const p6 = document.getElementById("table-6");
const p7 = document.getElementById("table-7");

const CELL_SIZE = 3;
const OFFSET = 0;


function selectPoint(rSquare) {
    const radius = Math.sqrt(rSquare);
    let R = radius + 1;

    let x, y, z;

    while (R > radius) {
        x = (Math.random() * 2 - 1) * radius;
        y = (Math.random() * 2 - 1) * radius;
        z = (Math.random() * 2 - 1) * radius;

        R = Math.sqrt(x * x + y * y + z * z);
    }

    return [x, y, z];
}

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

function randomColor(rSquare = 1.5) {
    let [t, u, v] = selectPoint(rSquare)

    let rgb = tuvToRgb(t, u, v)

    return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`
}

function drawFaces() {
    headerFaces.innerHTML = ""
    const FACE_SIZE = 60

    let count = Math.trunc(headerFaces.offsetWidth / FACE_SIZE)
    for (let i = 0; i < count; i++) {
        var face = document.createElement("span");
        face.className = "sample-face"
        face.style.width = `${FACE_SIZE}px`
        face.style.background = randomColor()
        headerFaces.appendChild(face)
    }
}

function face_row(container, size, rSquare) {
    container.innerHTML = ""

    for (let i = 0; i < 10; i++) {
        var face = document.createElement("span");
        face.className = "sample-face"
        face.style.width = `${size}px`
        face.style.background = randomColor(rSquare)
        container.appendChild(face)
    }
}

function tableFaces() {
    face_row(p1, 40, .1);
    face_row(p2, 40, .5);
    face_row(p3, 40, 1);
    face_row(p4, 40, 1.5);
    face_row(p5, 40, 2);
    face_row(p6, 40, 2.5);
    face_row(p7, 40, 10);
}

function drawGrid() {
    drawFaces()
    tableFaces()

    const width = window.innerWidth;
    const height = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;

    cvs.width = width * dpr;
    cvs.height = height * dpr;
    cvs.style.width = width + "px";
    cvs.style.height = height + "px";

    cx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(width / CELL_SIZE);
    const rows = Math.ceil(height / CELL_SIZE);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            cx.fillStyle = randomColor();
            cx.fillRect(
                x * CELL_SIZE,
                y * CELL_SIZE,
                CELL_SIZE - OFFSET,
                CELL_SIZE - OFFSET
            );
        }
    }
}

let resizeTimeout;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(drawGrid, 100);
});

drawGrid();