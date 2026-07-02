const polygon =  [[[0,0,0],[100,0,0],[100,0,100]],[[0,0,200],[100,100,200],[50, 50, 300]]];
let deg = 0;
let basis = { "x": 1, "y": 1, "z": 1 };
let ctx;
let canvas;

window.addEventListener("load", () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        basis.x = Math.sin(deg / 180 * Math.PI);
        basis.y = Math.cos(deg / 180 * Math.PI);
        deg += 4;
        if (deg >= 360) deg -= 360;
        polygon.forEach(face => {
            const v1 = [face[0][0] * basis.x - face[0][1] * basis.y, face[0][2]];
            const v2 = [face[1][0] * basis.x - face[1][1] * basis.y, face[1][2]];
            const v3 = [face[2][0] * basis.x - face[2][1] * basis.y, face[2][2]];
            line(v1[0], v1[1], v2[0], v2[1]);
            line(v2[0], v2[1], v3[0], v3[1]);
            line(v3[0], v3[1], v1[0], v1[1]);
        });
    }, 50);

});

function line(x1, y1, x2, y2) {
    const begin = convert(x1, y1);
    const end = convert(x2, y2);
    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function convert(x, y) {
    return { "x": canvas.width / 2 + x, "y": canvas.height - y }
}
