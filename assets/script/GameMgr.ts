import MapGuider from "./component/MapGuider";
import Movie from "./component/Movie";
import Monster from "./entity/Monster";
import Role from "./entity/Role";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameMgr extends cc.Component {
    @property(cc.Material)
    movieMaskShader: cc.Material = null;
    /**玩家控制的角色 */
    role: Role = null;

    static ins: GameMgr = null;

    onLoad() {
        GameMgr.ins = this;

        cc.dynamicAtlasManager.enabled = false;
        Movie.initMaskShader(this.movieMaskShader);
    }

    start() {
        this.role = Role.createRole({
            bodyId: 1,
            horseId: 5,
            weaponId: 303,
            parent: MapGuider.ins.node, 
            position: cc.v2(0, -1200)
        });

        for (let i = 0; i < 6; i++) {
            let random1 = [Math.random() * 200 - 100, Math.random() * 200 - 100]
            Monster.create({
                bodyId: 1,
                parent: MapGuider.ins.node,
                position: cc.v2(-20 + random1[0], -700 + random1[1]),
                direction: 3,
                activeRange: 400
            });
            let random2 = [Math.random() * 200 - 100, Math.random() * 200 - 100]
            Monster.create({
                bodyId: 2,
                parent: MapGuider.ins.node,
                position: cc.v2(-225 + random2[0], 110 + random2[1]),
                direction: 3,
                activeRange: 400
            });
            let random3 = [Math.random() * 200 - 100, Math.random() * 200 - 100]
            Monster.create({
                bodyId: 3,
                parent: MapGuider.ins.node,
                position: cc.v2(20 + random3[0], 740 + random3[1]),
                direction: 3,
                activeRange: 400
            });
        }
        
        MapGuider.ins.initCamera(cc.find("Canvas/Main Camera"), this.role.node);

        MapGuider.ins.node.on(MapGuider.EventType.CLICK_POSITION, (endLocation: cc.Vec2) => {
            let centerLocation = cc.v2(cc.winSize.width / 2, cc.winSize.height / 2);
            let vec = endLocation.sub(centerLocation);
            let endPos = cc.Camera.cameras[0].node.getPosition().add(vec);
            let path = MapGuider.ins.getPath(this.role.node.getPosition(), endPos);
            if (path instanceof Array) {
                this.role.movePath = path;
            }
        });
    }
}