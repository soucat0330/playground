import { Network } from "./script.v2.js"
import { params } from "./params.js"

const net = new Network([784, 50, 10]);
net.params = params;

window.addEventListener("load", () => {
    const canvas = document.getElementById("canvas");

    /**
     * @type {CanvasRenderingContext2D}
    */
    const ctx = canvas.getContext("2d");

    let isDrawing = false;

    const data = new Array(28).fill().map(() => new Array(28).fill(0));

    canvas.addEventListener("mousedown", (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        handleDraw(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        handleDraw(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener("mouseup", () => { isDrawing = false; });
    canvas.addEventListener("mouseleave", () => { isDrawing = false; });


    function getTouchPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    canvas.addEventListener("touchstart", (e) => {
        isDrawing = true;
        const pos = getTouchPos(e);
        handleDraw(pos.x, pos.y);
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
        if (!isDrawing) return;
        const pos = getTouchPos(e);
        handleDraw(pos.x, pos.y);
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchend", () => { isDrawing = false; });
    canvas.addEventListener("touchcancel", () => { isDrawing = false; });



    function handleDraw(clientX, clientY) {
        let x = Math.floor(clientX / 10);
        let y = Math.floor(clientY / 10);

        ctx.fillStyle = "white";
        draw(x, y);
        draw(x + 1, y);
        draw(x - 1, y);
        draw(x, y + 1);
        draw(x, y - 1);
    }

    function draw(x, y) {
        if (x < 0 || x >= 28 || y < 0 || y >= 28) return;
        ctx.fillRect(x * 10, y * 10, 10, 10);
        data[y][x] = 1;
    }

    document.getElementById("remove").addEventListener("click", () => {
        ctx.clearRect(0, 0, 280, 280);
        data.forEach(row => row.fill(0));
    });




    let images;
    let labels;
    document.getElementById("image").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        images = new Uint8Array(await file.arrayBuffer());
    });

    document.getElementById("label").addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        labels = new Uint8Array(await file.arrayBuffer());
    });

    const trainData = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
    ];

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    document.getElementById("learn").addEventListener("click", async () => {
        for (let i = 0; i < 60000; i++) {
            ctx.clearRect(0, 0, 280, 280);
            const input = new Array(784);
            for (let j = 0; j < 784; j++) {
                const b = images[16 + i * 784 + j];
                input[j] = b / 255;
                const y = Math.floor(j / 28);
                const x = j % 28;
                if (b != 0) {
                    ctx.fillStyle = `rgb(${b}, ${b}, ${b})`;
                    ctx.fillRect(x * 10, y * 10, 10, 10);
                }
            }
            net.backward(input, trainData[labels[i + 8]]);
            if (i % 1000 == 0) console.log(i);
            await sleep(1);
        }
    });

    document.getElementById("predict").addEventListener("click", () => {
        const output = net.predict(data.flat());
        console.log(output);
        let max_i = 0;
        let max_num = 0;
        for (let i = 0; i < 10; i++) {
            if (max_num <= output[i]) {
                max_i = i;
                max_num = output[i];
            }
        }
        alert(`${(max_num * 100).toFixed(2)}%の確率で${max_i}です`);
    });


    //デバッグ用
    window.getData = () => data;
    window.getParams = () => net.params;
    window.images = () => images;
});
