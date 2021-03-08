import ResConfig from "../config/ResConfig";
import Role from "../entity/Role";
import GameMgr from "../GameMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameView extends cc.Component {
    @property(cc.SpriteFrame)
    skillIcons: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    avatarImages: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    avatarSprite: cc.Sprite = null;
    @property(cc.AudioClip)
    btnAudio: cc.AudioClip = null;

    start() {
        this.initBtnSkill();
    }

    initBtnSkill() {
        let children = this.node.getChildByName("skills").children;
        let skillIds = [1, 2, 3]; 
        children[0].on(cc.Node.EventType.TOUCH_END, () => {
            GameMgr.ins.role.attack(0);
        });
        children[1].on(cc.Node.EventType.TOUCH_END, () => {
            GameMgr.ins.role.attack(skillIds[0]);
        });
        children[2].on(cc.Node.EventType.TOUCH_END, () => {
            GameMgr.ins.role.attack(skillIds[1]);
        });
        children[3].on(cc.Node.EventType.TOUCH_END, () => {
            GameMgr.ins.role.attack(skillIds[2]);
        });
        GameMgr.ins.role.eventBox.on(Role.EventType.WEAPON_CHANGE, this, (weaponId: number) => {
            let iconIndex = 0;
            if ([302, 308].includes(weaponId)) {
                iconIndex = 3;
                skillIds = [4, 5, 6];
            } else if ([303, 304].includes(weaponId)) {
                iconIndex = 6;
                skillIds = [7, 8, 9];
            } else if ([309, 310].includes(weaponId)) {
                iconIndex = 9;
                skillIds = [10, 11, 12];
            } else {
                iconIndex = 0;
                skillIds = [1, 2, 3];
            }
            for (let i = 0; i < 3; i++) {
                children[i + 1].getComponent(cc.Sprite).spriteFrame = this.skillIcons[iconIndex + i];
            }
        });
    }

    changeAvatar() {
        let index = this.avatarImages.indexOf(this.avatarSprite.spriteFrame);
        index == -1 && ((index = 0) || true) || (index = 1 - index);
        this.avatarSprite.spriteFrame = this.avatarImages[index];
        GameMgr.ins.role.reloadBody(ResConfig.movieBody[index + 1].id);
        this.playBtnAudio();
    }

    showBagView() {
        let node = this.node.getChildByName("bag_view");
        node.on(cc.Node.EventType.TOUCH_END, this.hideBagView, this);
        node.active = true;
        this.playBtnAudio();
    }

    hideBagView() {
        let node = this.node.getChildByName("bag_view");
        node.off(cc.Node.EventType.TOUCH_END, this.hideBagView, this);
        node.active = false;
        this.playBtnAudio();
    }

    playBtnAudio() {
        cc.audioEngine.playEffect(this.btnAudio, false);
    }
}