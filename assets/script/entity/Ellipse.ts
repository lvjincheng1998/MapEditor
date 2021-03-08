const {ccclass, property} = cc._decorator;

@ccclass
export default class Ellipse extends cc.Component {
    private _width: number;
    private _height: number;
    private _a: number;
    private _b: number;
    private _rangeYHandler: Function;
    private _ellipseDrawNode: cc.Node = null;

    public static create(data: EllipseCreateData): Ellipse {
        let node = new cc.Node();
        let ellipse = node.addComponent(Ellipse);
        ellipse.init(data);
        data.parent.addChild(node);
        return ellipse;
    }

    private init(data: EllipseCreateData) {
        this._width = data.width;
        this._height = data.height;
        this._a = this._width / 2;
        this._b = this._height / 2;
        this._rangeYHandler = data.rangeYHandler instanceof Function ? data.rangeYHandler : null;
        this.node.setPosition(data.position ? data.position : cc.Vec2.ZERO);
    }

    getEllipseRangeY(x: number): number[] {
        let yPow2 = (1 - (Math.pow(x, 2) / Math.pow(this._a, 2))) * Math.pow(this._b, 2);
        if (yPow2 < 0) {
            return null;
        }
        let y = Math.sqrt(yPow2);
        let rangeY = [-y, y];
        if (this._rangeYHandler instanceof Function) {
            return this._rangeYHandler(rangeY);
        }
        return rangeY;
    }

    debugDrawEllipse() {
        if (this._ellipseDrawNode && this._ellipseDrawNode.isValid) {
            this._ellipseDrawNode.destroy();
        }
        this._ellipseDrawNode = new cc.Node();
        this._ellipseDrawNode.setPosition(this.node.getPosition());
        let graphics = this._ellipseDrawNode.addComponent(cc.Graphics);
        this.node.parent.addChild(this._ellipseDrawNode);
        graphics.strokeColor = cc.Color.RED;
        for (let x = -this._a; x <= this._a; x++) {
            let rangeY = this.getEllipseRangeY(x);
            if (rangeY) {
                graphics.moveTo(x, rangeY[0]);
                graphics.lineTo(x, rangeY[1]);
            }
        }
        graphics.stroke();
    }

    checkInEllipse(position: cc.Vec2): boolean {
        let point = position.sub(this.node.getPosition());
        let rangeY = this.getEllipseRangeY(point.x);
        if (rangeY) {
            return point.y >= rangeY[0] && point.y <= rangeY[1];
        }
        return false;
    }
}

declare global {
    interface EllipseCreateData {
        width: number;
        height: number;
        parent: cc.Node;
        position?: cc.Vec2 | cc.Vec3;
        rangeYHandler?: (rangeY: number[]) => number[];
    }
}