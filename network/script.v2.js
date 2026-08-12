class NetMath {
    /**
     * @returns {Number} 平均:0,標準偏差:1の正規分布からランダムにサンプリングされた値
     */
    static randomNormal() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    /**
     * @param {Number} inputSize 前の層のノード数
     * @returns {Number} 平均:0,標準偏差:1/sqrt(inputSize)の正規分布からランダムにサンプリングされた値
     */
    static xavierInit(inputSize) {
        const std = Math.sqrt(1 / inputSize);
        return NetMath.randomNormal() * std;
    }

    /**
     * @param {Number} x
     * @returns {Number} シグモイド関数を適用した値
     */
    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * @param {Number} y 既にシグモイド関数が適用されている必要がある
     * @returns {Number} シグモイド関数の導関数を適用した値
     */
    static sigmoidDerivative(y) {
        return y * (1 - y);
    }

}

export class Network {
    /**
     * @param {Number[]} nodeSize 各層のノード数の配列
     */
    constructor(nodeSize) {
        if (nodeSize === undefined || nodeSize.length <= 1) {
            throw new Error("node配列は少なくとも2つ以上の要素が必要です。");
        }
        this.nodeSize = nodeSize;
        this.L = nodeSize.length;
        this.params = new Array(nodeSize.length - 1).fill().map((layer, i) => ({
            weight: new Array(nodeSize[i + 1]).fill().map(() =>
                new Array(nodeSize[i]).fill().map(() => NetMath.xavierInit(nodeSize[i]))
            ),
            bias: new Array(nodeSize[i + 1]).fill(0)
        }));
    }

    /**
     * @param {Number[]} input 入力
     */
    forward(input) {
        if (input.length !== this.nodeSize[0]) {
            throw new Error("入力の個数が一致しません");
        }

        const neurons = new Array(this.L).fill().map((_, i) => new Array(this.nodeSize[i]).fill(0));
        neurons[0] = input;

        for (let i = 0; i < this.L - 1; i++) {
            for (let j = 0; j < this.nodeSize[i + 1]; j++) {
                let sum = 0;

                for (let k = 0; k < this.nodeSize[i]; k++) {
                    sum += neurons[i][k] * this.params[i].weight[j][k];
                }

                sum += this.params[i].bias[j];
                neurons[i + 1][j] = NetMath.sigmoid(sum);
            }
        }
        return neurons;
    }

    /**
     * @param {Number[]} input 
     * @param {Number[]} target 
     * @param {Number} learningRate 
     */
    backward(input, target, learningRate = 0.1) {
        const outputLayerSize = this.nodeSize[this.L - 1];
        if (input.length !== this.nodeSize[0]) throw new Error("入力の個数が一致しません");
        if (target.length !== outputLayerSize) throw new Error("出力の個数が一致しません");

        const neurons = this.forward(input);

        const deltas = new Array(this.L).fill().map((_, i) => new Array(this.nodeSize[i]).fill(0));

        for (let i = 0; i < outputLayerSize; i++) {
            const output = neurons[this.L - 1][i];
            const error = output - target[i];
            deltas[this.L - 1][i] = error * NetMath.sigmoidDerivative(output);
        }

        for (let i = this.L - 2; i > 0; i--) {
            for (let j = 0; j < this.nodeSize[i]; j++) {
                let sum = 0;
                for (let k = 0; k < this.nodeSize[i + 1]; k++) {
                    sum += this.params[i].weight[k][j] * deltas[i + 1][k];
                }
                const output = neurons[i][j];
                deltas[i][j] = sum * NetMath.sigmoidDerivative(output);
            }
        }

        for (let i = 0; i < this.L - 1; i++) {
            for (let j = 0; j < this.nodeSize[i + 1]; j++) {
                this.params[i].bias[j] -= learningRate * deltas[i + 1][j];

                for (let k = 0; k < this.nodeSize[i]; k++) {
                    this.params[i].weight[j][k] -= learningRate * deltas[i + 1][j] * neurons[i][k];
                }
            }
        }
    }

    predict(input) {
        const neurons = this.forward(input);
        return neurons[this.L - 1];
    }
}