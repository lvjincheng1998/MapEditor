import glow_shader from "../../shader/glow_shader";
import ResConfig from "../config/ResConfig";
import BaseView from "../component/BaseView";
import GameMgr from "../GameMgr";
import Drawer from "../component/Drawer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BagView extends BaseView {
    @property(cc.Material)
    glowMaterial: cc.Material = null;

    onLoad() {
        super.onLoad();

        this.createProps(this.createLayout());
    }

    createLayout(): cc.Node {
        let node = new cc.Node();
        this.node.addChild(node);
        let layout = node.addComponent(cc.Layout);
        layout.type = cc.Layout.Type.GRID;
        let graphics = node.addComponent(cc.Graphics);
        let drawer = new Drawer(graphics);
        let {width, height, padding} = drawer.drawGird(6, 5, 120, 30);
        node.setContentSize(width, height);
        layout.paddingTop = padding;
        layout.paddingLeft = padding;
        layout.paddingRight = padding;
        layout.paddingBottom = padding;
        return node;
    }

    createProps(parent: cc.Node) {
        for (let key in ResConfig.movieHorse) {
            cc.resources.load("image/horse/" + key, cc.SpriteFrame, (err, asset: cc.SpriteFrame) => {
                if (err) return;

                let baseNode = new cc.Node();
                baseNode.setContentSize(120, 120);
                baseNode.on(cc.Node.EventType.TOUCH_END, () => {
                    if (GameMgr.ins.role.horseId == parseInt(key)) {
                        GameMgr.ins.role.reloadHorse(0);
                        return;
                    }
                    GameMgr.ins.role.reloadHorse(parseInt(key));
                });

                let spriteNode = new cc.Node();
                spriteNode.setScale(0.8);
                spriteNode.addComponent(cc.Sprite).spriteFrame = asset;
                spriteNode.getComponent(cc.Sprite).setMaterial(0, this.glowMaterial);

                let glowShader = spriteNode.addComponent(glow_shader);
                glowShader.scan_radius = 0.05;
                glowShader.glow_color = cc.Color.WHITE;

                baseNode.addChild(spriteNode);
                parent.addChild(baseNode);
            });
        }
        for (let key in ResConfig.movieWeapon) {
            cc.resources.load("image/weapon/" + key, cc.SpriteFrame, (err, asset: cc.SpriteFrame) => {
                if (err) return;

                let baseNode = new cc.Node();
                baseNode.setContentSize(120, 120);
                baseNode.on(cc.Node.EventType.TOUCH_END, () => {
                    if (GameMgr.ins.role.weaponId == parseInt(key)) {
                        GameMgr.ins.role.reloadWeapon(0);
                        return;
                    }
                    GameMgr.ins.role.reloadWeapon(parseInt(key));
                });

                let spriteNode = new cc.Node();
                spriteNode.setScale(1.2);
                spriteNode.addComponent(cc.Sprite).spriteFrame = asset;
                spriteNode.getComponent(cc.Sprite).setMaterial(0, this.glowMaterial);
                
                let shaderInfo = ResConfig.weaponShaderInfos[key];
                let glowShader = spriteNode.addComponent(glow_shader);
                glowShader.scan_radius = shaderInfo.scanRadius;
                glowShader.glow_color = cc.color(
                    shaderInfo.glowColor[0],
                    shaderInfo.glowColor[1],
                    shaderInfo.glowColor[2],
                    shaderInfo.glowColor[3]
                );

                baseNode.addChild(spriteNode);
                parent.addChild(baseNode);
            });
        }
    }
}