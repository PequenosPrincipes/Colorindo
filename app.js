const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushBtn = document.getElementById('brushBtn');
const bucketBtn = document.getElementById('bucketBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const imageSelector = document.getElementById('imageSelector');
const backgroundMusic = document.getElementById('backgroundMusic');
const playPauseBtn = document.getElementById('playPauseBtn');

let usingBrush = true;
let isDrawing = false;
let imageLoaded = false;
let currentImage = new Image();

canvas.addEventListener('mousedown', (event) => {
    if (usingBrush) {
        isDrawing = true;
        draw(event);  // Desenha imediatamente na posição inicial
    } else {
        fill(event);
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (usingBrush && isDrawing) {
        draw(event);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

function draw(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    ctx.fillStyle = colorPicker.value;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2, true);
    ctx.fill();
}

function fill(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (!imageLoaded) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;

    const startColor = getPixelColor(x, y, data, width);
    const fillColor = hexToRgb(colorPicker.value);

    if (colorsMatch(startColor, fillColor)) return;

    const stack = [[x, y]];

    while (stack.length > 0) {
        const [curX, curY] = stack.pop();
        const index = (curY * width + curX) * 4;

        const currentColor = [data[index], data[index + 1], data[index + 2]];

        if (colorsMatch(currentColor, startColor)) {
            data[index] = fillColor.r;
            data[index + 1] = fillColor.g;
            data[index + 2] = fillColor.b;

            if (curX + 1 < width) stack.push([curX + 1, curY]);
            if (curX - 1 >= 0) stack.push([curX - 1, curY]);
            if (curY + 1 < canvas.height) stack.push([curX, curY + 1]);
            if (curY - 1 >= 0) stack.push([curX, curY - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(x, y, data, width) {
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2]];
}

function colorsMatch(color1, color2) {
    return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

brushBtn.addEventListener('click', () => {
    usingBrush = true;
});

bucketBtn.addEventListener('click', () => {
    usingBrush = false;
});

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'desenho.png';
    link.click();
});

imageSelector.addEventListener('change', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentImage.src = imageSelector.value;
    currentImage.onload = () => {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        imageLoaded = true;
    };
});

playPauseBtn.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        playPauseBtn.textContent = 'Pausar Música';
    } else {
        backgroundMusic.pause();
        playPauseBtn.textContent = 'Começar Música';
    }
});
