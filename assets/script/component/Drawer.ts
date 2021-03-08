export default class Drawer {
    graphics: cc.Graphics;

    constructor(graphics: cc.Graphics) {
        this.graphics = graphics;
        this.graphics.lineWidth = 10;
        this.graphics.strokeColor = cc.Color.GRAY;
        this.graphics.lineCap = cc.Graphics.LineCap.ROUND;
    }

    drawGird(
        row: number, 
        col: number, 
        cellSize: number, 
        borderRadius: number
    ): {
        width: number, 
        height: number, 
        padding: number
    } {
        let width = col * cellSize;
        let height = row * cellSize;

        for (let i = 0; i <= row; i++) {
            if (i == 0 || i == row) {
                this.graphics.moveTo(-width / 2 + borderRadius, -height / 2 + i * cellSize);
                this.graphics.lineTo(width / 2 - borderRadius, -height / 2 + i * cellSize)
            } else {
                this.graphics.moveTo(-width / 2, -height / 2 + i * cellSize);
                this.graphics.lineTo(width / 2, -height / 2 + i * cellSize)
            }
        }
        for (let i = 0; i <= col; i++) {
            if (i == 0 || i == col) {
                this.graphics.moveTo(-width / 2 + cellSize * i, -height / 2 + borderRadius);
                this.graphics.lineTo(-width / 2 + cellSize * i, -height / 2 + row * cellSize - borderRadius);
            } else {
                this.graphics.moveTo(-width / 2 + cellSize * i, -height / 2);
                this.graphics.lineTo(-width / 2 + cellSize * i, -height / 2 + row * cellSize);
            }
        }
        this.graphics.arc(-width / 2 + borderRadius, height / 2 - borderRadius, borderRadius, Math.PI / 2, Math.PI, true);
        this.graphics.arc(width / 2 - borderRadius, height / 2 -borderRadius, borderRadius, 0, Math.PI / 2, true);
        this.graphics.arc(-width / 2 + borderRadius, -height / 2 + borderRadius, borderRadius, Math.PI, Math.PI * 1.5, true);
        this.graphics.arc(width / 2 - borderRadius, -height / 2 + borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2, true);
        this.graphics.stroke();

        return {
            width: width + this.graphics.lineWidth, 
            height: height + this.graphics.lineWidth, 
            padding: this.graphics.lineWidth / 2
        };
    }
}