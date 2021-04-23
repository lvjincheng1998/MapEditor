const {ccclass, property} = cc._decorator;

/**地图矩阵中的矩形类型 */
export enum MapRectType { 
    /**超出边界 */
    OUT_BOUND = -1, 
    /**常规 */
    NONE = 0, 
    /**透明 */
    BLUE = 1, 
    /**阻塞 */
    RED = 2
};

/**
 * 地图指导组件
 * @description 地图加载、渲染、寻路
 * @author JC
 */
@ccclass
export default class MapGuider extends cc.Component {
    /**地图资源加载路径 */
    @property
    private path: string = "";

    /**地图矩阵数据 */
    private matrix: number[][];
    /**地图矩阵行数 */
    private rowCount: number;
    /**地图矩阵列数 */
    private columnCount: number;
    /**地图网格单元大小 */
    private gridSize: number;
    /**地图宽高 */
    private mapSize: cc.Size;
    /**地图基准点（左上角） */
    public basePoint: cc.Vec2;

    /**地图渲染的根节点 */
    private imageRootNode: cc.Node = null;
    /**地图是否加载并渲染完成 */
    private initialized: boolean = false;

    /**地图事件 */
    public static EventType = {
        LOADED: "LOADED",
        CLICK_POSITION: "CLICK_POSITION"
    }

    /**脚本实例 */
    public static ins: MapGuider = null;

    public onLoad() {
        MapGuider.ins = this;

        this.load();
    }

    public onDestroy() {
        if (MapGuider.ins == this) {
            MapGuider.ins = null;
        }
    }

    public lateUpdate() {
        this.updateCamera();
    }

    private load() {
        if (!this.imageRootNode) {
            this.imageRootNode = new cc.Node("iamge_root");
            this.node.addChild(this.imageRootNode);
        }
        this.imageRootNode.off(cc.Node.EventType.TOUCH_END, this.emitClickPosition, this);

        cc.resources.loadDir(this.path, cc.Asset, (error, assets) => {
            if (error) {
                return cc.error(error);
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
            this.loadComplete(imageAssets, jsonAsset);
        });
    }

    private loadComplete(imageAssets: cc.SpriteFrame | cc.SpriteFrame[], jsonAsset: cc.JsonAsset) {
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

        this.imageRootNode.on(cc.Node.EventType.TOUCH_END, this.emitClickPosition, this);

        this.initialized = true;

        this.node.emit(MapGuider.EventType.LOADED);
    }  

    private emitClickPosition(e: cc.Event.EventTouch) {
        this.node.emit(MapGuider.EventType.CLICK_POSITION, e.getLocation());
    }

    public getRectType(x: number, y: number): MapRectType {
        if (!this.initialized) return MapRectType.OUT_BOUND;
        x = x - this.basePoint.x;
        y = this.basePoint.y - y;
        let row = Math.floor(y / this.gridSize);
        let column = Math.floor(x / this.gridSize);
        if (row < 0 || column < 0 || row >= this.rowCount || column >= this.columnCount) {
            return MapRectType.OUT_BOUND;
        }
        return this.matrix[row][column];
    }

    public getPath(startPoint: cc.Vec2, endPoint: cc.Vec2): {x: number, y: number}[] {
        let outList = [];
        if (!this.initialized) {
            return outList;
        }
        if (startPoint.equals(endPoint)) {
            return outList;
        }
        let endX = Math.floor((endPoint.x - this.basePoint.x) / this.gridSize);
        let endY = Math.floor((this.basePoint.y - endPoint.y) / this.gridSize);
        if (this.matrix[endY][endX] == MapRectType.RED) {
            return outList;
        }
        let startX = Math.floor((startPoint.x - this.basePoint.x) / this.gridSize);
        let startY = Math.floor((this.basePoint.y - startPoint.y) / this.gridSize);
        let target = MapNode.calculate(startX, startY, endX, endY, this.matrix);
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

    public static getNextPosition(position: cc.Vec2, path: {x: number, y: number}[], speed: number, dt: number) {
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

    private updateCamera() {
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
class MapNode {
    public parent: MapNode;
    private x: number;
    private y: number;
    private f: number;
    private g: number;
    private h: number;
    private static startNode: MapNode;
    private static endNode: MapNode;
    private static openList: MapNode[];
    private static closeList: MapNode[];
    private static matrix: number[][];
    private static row: number;
    private static column: number;

    constructor(x: number, y:number, parent: MapNode) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.g = this.parent ? this.parent.g + Math.sqrt((x - parent.x) * (x - parent.x) + (y - parent.y) * (y - parent.y)) : 0;
        this.h = MapNode.endNode ? Math.abs(MapNode.endNode.x - this.x) + Math.abs(MapNode.endNode.y - this.y) : 0;
        this.f = this.g + this.h;
    }

    private equal(node: MapNode) {
        if (node.x == this.x && node.y == this.y) {
            return true;
        } else {
            return false;
        }
    }

    private compareTo(node) {
        return this.f - node.f;
    }

    private close() {
        let list = new Array();
        let index = MapNode.openList.indexOf(this);
        for(let i=0; i < MapNode.openList.length; i++){
            if(index == i) {
                continue;
            }
            list.push(MapNode.openList[i]);
        }
        MapNode.openList = list;
        MapNode.closeList.push(this);
    }

    private getFromOpenList() {
        for(let i = 0; i < MapNode.openList.length; i++){
            if (MapNode.openList[i].equal(this)) {
                return MapNode.openList[i];
            }
        }
        return null;
    }

    private getFromCloseList() {
        for(let i = 0; i < MapNode.closeList.length; i++){
            if (MapNode.closeList[i].equal(this)) {
                return MapNode.closeList[i];
            }
        }
        return null;
    }

    private update(node: MapNode) {
        this.parent = node.parent;
        this.x = node.x;
        this.y = node.y;
        this.f = node.y;
        this.g = node.g;
        this.h = node.h;
    }

    private isEnd() {
        if (this.equal(MapNode.endNode)) {
            return true;
        } else {
            return false;
        }
    }

    private static openNearbyNodes(offsetX: number, offsetY: number, node: MapNode) {
        let x = node.x + offsetX;
        let y = node.y + offsetY;
        if (x < 0 ||x > MapNode.column-1) {
            return;
        }
        if (y < 0 || y > MapNode.row - 1) {
            return;
        }
        if (MapNode.matrix[y][x] == MapRectType.RED) {
            return;
        }
        if (offsetX != 0 && offsetY != 0) {
            if (MapNode.matrix[node.y][node.x + offsetX] == MapRectType.RED || MapNode.matrix[node.y + offsetY][node.x] == MapRectType.RED) {
                return;
            }
        }
        let newNode = new MapNode(x,y,node);
        let openNode = newNode.getFromOpenList();
        let closeNode = newNode.getFromCloseList();
        if (!openNode && !closeNode) {
            MapNode.openList.push(newNode);
        } else if(openNode && newNode.compareTo(openNode) < 0) {
            openNode.update(newNode);
        }
    }

    private static getBestNode() {
        MapNode.openList.sort((a,b) => {
            return a.compareTo(b);
        });
        if (MapNode.openList.length > 0) {
            return MapNode.openList[0];
        } else {
            return null;
        }
    }

    public static calculate(startX: number, startY: number, endX: number, endY: number, matrix: number[][]) {
        this.startNode = new MapNode(startX, startY, null);
        this.endNode = new MapNode(endX, endY, null);
        this.openList = [];
        this.closeList = [];
        this.matrix = matrix;
        this.row = this.matrix.length;
        this.column = this.matrix[0].length;

        let target = MapNode.startNode;
        MapNode.openList.push(target);
        while (target && !target.isEnd()) {
            MapNode.openNearbyNodes(-1, 0, target);
            MapNode.openNearbyNodes(1, 0, target);
            MapNode.openNearbyNodes(0, -1, target);
            MapNode.openNearbyNodes(0, 1, target);
            MapNode.openNearbyNodes(1, 1, target);
            MapNode.openNearbyNodes(1, -1, target);
            MapNode.openNearbyNodes(-1, 1, target);
            MapNode.openNearbyNodes(-1, -1, target);
            target.close();
            target = MapNode.getBestNode();
        }
        return target;
    }
}