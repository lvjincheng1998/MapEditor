const {ccclass, property} = cc._decorator;

export enum JCRectType { OUT_BOUND = -1, NONE = 0, BLUE = 1, RED = 2 };

@ccclass
export default class MapGuider extends cc.Component {
    @property
    path: string = "";

    matrix: number[][];
    rowCount: number;
    columnCount: number;
    gridSize: number;
    mapSize: cc.Size;
    basePoint: cc.Vec2;

    imageRootNode: cc.Node = null;
    initialized: boolean = false;

    static EventType = {
        LOADED: "LOADED",
        CLICK_POSITION: "CLICK_POSITION"
    }
    static ins: MapGuider = null;

    onLoad() {
        MapGuider.ins = this;

        this.load();
    }

    onDestroy() {
        if (MapGuider.ins == this) {
            MapGuider.ins = null;
        }
    }

    load() {
        if (!this.imageRootNode) {
            this.imageRootNode = new cc.Node("iamge_root");
            this.node.addChild(this.imageRootNode);
        }
        this.imageRootNode.off(cc.Node.EventType.TOUCH_END, this._emitClickPosition, this);

        cc.resources.loadDir(this.path, cc.Asset, (error, assets) => {
            if (error) {
                cc.error(error);
                return;
            }
            let imageAssets = [];
            let jsonAsset = null;
            for (let asset of assets) {
                if (asset instanceof cc.SpriteFrame) {
                    imageAssets.push(asset);
                } else if (asset instanceof cc.JsonAsset) {
                    jsonAsset = asset;
                }
            }
            this._loadComplete(imageAssets, jsonAsset);
        });
    }

    private _loadComplete(imageAssets: cc.SpriteFrame | cc.SpriteFrame[], jsonAsset: cc.JsonAsset) {
        if (!imageAssets || !jsonAsset) return;

        this.matrix = jsonAsset.json.matrix;
        this.rowCount = jsonAsset.json.rowCount;
        this.columnCount = jsonAsset.json.columnCount;
        this.gridSize = jsonAsset.json.gridSize;
        this.mapSize = cc.size(jsonAsset.json.width, jsonAsset.json.height);
        this.basePoint = cc.v2(-this.mapSize.width / 2, this.mapSize.height / 2);
        
        this.imageRootNode.setContentSize(this.mapSize);

        if (imageAssets instanceof Array) {    
            let imageNodes: cc.Node[][] = [[]];
            for (let imageAsset of imageAssets) {
                let rowColumnStrings = imageAsset.name.split("_");
                let row = parseInt(rowColumnStrings[0]);
                let column = parseInt(rowColumnStrings[1]);
                let imageNode = new cc.Node(imageAsset.name);
                imageNode.setAnchorPoint(0, 1);
                imageNode.addComponent(cc.Sprite).spriteFrame = imageAsset;
                this.imageRootNode.addChild(imageNode);
                if (!(imageNodes[row] instanceof Array)) imageNodes[row] = [];
                imageNodes[row][column] = imageNode;
            }
            let x = 0;
            let y = 0;
            for (let r = 0; r < imageNodes.length; r++) {
                x = 0;
                for (let c = 0; c < imageNodes[r].length; c++) {
                    let image = imageNodes[r][c];
                    image.setPosition(this.basePoint.add(cc.v2(x, y)))
                    x += image.width;
                    if (c == imageNodes[r].length - 1) y -= image.height;
                }
            }
        } else {
            this.imageRootNode.addComponent(cc.Sprite).spriteFrame = imageAssets as cc.SpriteFrame;
        }

        this.imageRootNode.on(cc.Node.EventType.TOUCH_END, this._emitClickPosition, this);

        this.initialized = true;

        this.node.emit(MapGuider.EventType.LOADED);
    }  

    private _emitClickPosition(e: cc.Event.EventTouch) {
        this.node.emit(MapGuider.EventType.CLICK_POSITION, e.getLocation());
    }

    getRectType(x: number, y: number): JCRectType {
        if (!this.initialized) return JCRectType.OUT_BOUND;
        x = x - this.basePoint.x;
        y = this.basePoint.y - y;
        let row = Math.floor(y / this.gridSize);
        let column = Math.floor(x / this.gridSize);
        if (row < 0 || column < 0 || row >= this.rowCount || column >= this.columnCount) {
            return JCRectType.OUT_BOUND;
        }
        return this.matrix[row][column];
    }

    getPath(startPoint: cc.Vec2, endPoint: cc.Vec2): {x: number, y: number}[] {
        let outList = [];
        if (!this.initialized) {
            return outList;
        }
        if (startPoint.equals(endPoint)) {
            return outList;
        }
        let endX = Math.floor((endPoint.x - this.basePoint.x) / this.gridSize);
        let endY = Math.floor((this.basePoint.y - endPoint.y) / this.gridSize);
        if (this.matrix[endY][endX] == JCRectType.RED) {
            return outList;
        }
        let startX = Math.floor((startPoint.x - this.basePoint.x) / this.gridSize);
        let startY = Math.floor((this.basePoint.y - startPoint.y) / this.gridSize);
        let target = Node.calculate(startX, startY, endX, endY, this.matrix);
        while (target) {
            outList.push(target);
            target = target.parent;
        }
        if (outList.length > 0) {
            for (let node of outList) {
                node.x = this.basePoint.x + node.x * this.gridSize;
                node.y = this.basePoint.y - node.y * this.gridSize;
            }
            if (outList.length < 3) {
                outList = [endPoint, startPoint];
            } else {
                outList.pop();
                outList.shift();
                outList = [endPoint].concat(outList).concat([startPoint]);
            }
        }
        return outList;
    }

    static getNextPosition(position: cc.Vec2, path: {x: number, y: number}[], speed: number, dt: number) {
        let dx = speed * dt;
        while (true) {
            let point = path[path.length - 1];
            let newPos = cc.v2(point.x, point.y);
            let vec = newPos.sub(position);
            let mag = vec.mag();
            if (dx < mag) {
                return position.add(vec.mul(dx/mag));
            } else {
                dx -= mag;
                path.pop();
                if (path.length == 0) {
                    return newPos;
                }
            }
        }
    }

    private cameraNode: cc.Node = null;
    private cameraTarget: cc.Node = null;

    public initCamera(node: cc.Node, target: cc.Node) {
        this.cameraNode = node;
        this.cameraTarget = target;
    }

    public updateCamera() {
        if (!this.cameraNode || !this.cameraNode.isValid) return;
        if (!this.cameraTarget || !this.cameraTarget.isValid) return;
        if (!MapGuider.ins || !MapGuider.ins.initialized) return;
        let winWidthHalf = cc.winSize.width / 2;
        let borderLeft = -MapGuider.ins.mapSize.width / 2;
        let borderRight = MapGuider.ins.mapSize.width / 2;
        let roleLeftX = this.cameraTarget.x - winWidthHalf;
        let roleRightX = this.cameraTarget.x + winWidthHalf;
        if (roleLeftX < borderLeft) this.cameraNode.x = borderLeft + winWidthHalf;
        else if (roleRightX > borderRight) this.cameraNode.x = borderRight - winWidthHalf;
        else this.cameraNode.x = this.cameraTarget.x;
        let winHeightHalf = cc.winSize.height / 2;
        let borderUp = MapGuider.ins.mapSize.height / 2;
        let borderDown = -MapGuider.ins.mapSize.height / 2;
        let roleUpY = this.cameraTarget.y + winHeightHalf;
        let roleDownY = this.cameraTarget.y - winHeightHalf;
        if (roleUpY > borderUp) this.cameraNode.y = borderUp - winHeightHalf;
        else if (roleDownY < borderDown) this.cameraNode.y = borderDown + winHeightHalf;
        else this.cameraNode.y = this.cameraTarget.y;
    }
}

/**A*寻路算法的网格节点 */
class Node {
    x: number;
    y: number;
    parent: Node;
    f: number;
    g: number;
    h: number;
    static startNode: Node;
    static endNode: Node;
    static openList: Node[];
    static closeList: Node[];
    static matrix: number[][];
    static row: number;
    static column: number;

    static calculate(startX: number, startY: number, endX: number, endY: number, matrix: number[][]) {
        this.startNode = new Node(startX, startY, null);
        this.endNode = new Node(endX, endY, null);
        this.openList = [];
        this.closeList = [];
        this.matrix = matrix;
        this.row = this.matrix.length;
        this.column = this.matrix[0].length;

        let target = Node.startNode;
        Node.openList.push(target);
        while (target && !target.isEnd()) {
            Node.openNearbyNodes(-1,0,target);
            Node.openNearbyNodes(1,0,target);
            Node.openNearbyNodes(0,-1,target);
            Node.openNearbyNodes(0,1,target);
            Node.openNearbyNodes(1,1,target);
            Node.openNearbyNodes(1,-1,target);
            Node.openNearbyNodes(-1,1,target);
            Node.openNearbyNodes(-1,-1,target);
            target.close();
            target = Node.getBestNode();
        }
        return target;
    }

    constructor(x: number, y:number, parent: Node) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        if (this.parent) {
            this.g = this.parent.g + Math.sqrt(
                (x - parent.x) * (x - parent.x) + 
                (y - parent.y) * (y - parent.y));
        } else {
            this.g = 0;
        }
        if (Node.endNode) {
            this.h = Math.abs(Node.endNode.x - this.x) + Math.abs(Node.endNode.y - this.y);
        } else {
            this.h = 0;
        }
        this.f = this.g + this.h;
    }

    equal(node: Node) {
        if (node.x == this.x && node.y == this.y) {
            return true;
        } else {
            return false;
        }
    }

    compareTo(node) {
        return this.f - node.f;
    }

    close() {
        let list = new Array();
        let index = Node.openList.indexOf(this);
        for(let i=0; i < Node.openList.length; i++){
            if(index == i) {
                continue;
            }
            list.push(Node.openList[i]);
        }
        Node.openList = list;
        Node.closeList.push(this);
    }

    getFromOpenList() {
        for(let i = 0; i < Node.openList.length; i++){
            if (Node.openList[i].equal(this)) {
                return Node.openList[i];
            }
        }
        return null;
    }

    getFromCloseList() {
        for(let i = 0; i < Node.closeList.length; i++){
            if (Node.closeList[i].equal(this)) {
                return Node.closeList[i];
            }
        }
        return null;
    }

    update(node: Node) {
        this.x = node.x;
        this.y = node.y;
        this.parent = node.parent;
        this.f = node.y;
        this.g = node.g;
        this.h = node.h;
    }

    isEnd() {
        if (this.equal(Node.endNode)) {
            return true;
        } else {
            return false;
        }
    }

    static openNearbyNodes(offsetX: number, offsetY: number, node: Node) {
        let x = node.x + offsetX;
        let y = node.y + offsetY;
        if (x < 0 ||x > Node.column-1) {
            return;
        }
        if (y < 0 || y > Node.row - 1) {
            return;
        }
        if (Node.matrix[y][x] == JCRectType.RED) {
            return;
        }
        if (offsetX != 0 && offsetY != 0) {
            if (Node.matrix[node.y][node.x + offsetX] == JCRectType.RED || Node.matrix[node.y + offsetY][node.x] == JCRectType.RED) {
                return;
            }
        }
        let newNode = new Node(x,y,node);
        let openNode = newNode.getFromOpenList();
        let closeNode = newNode.getFromCloseList();
        if (!openNode && !closeNode) {
            Node.openList.push(newNode);
        } else if(openNode && newNode.compareTo(openNode) < 0) {
            openNode.update(newNode);
        }
    }

    static getBestNode() {
        Node.openList.sort((a,b) => {
            return a.compareTo(b);
        });
        if (Node.openList.length > 0) {
            return Node.openList[0];
        } else {
            return null;
        }
    }
}