import Movie from "../component/Movie";
import ResConfig from "../config/ResConfig";
import { EntityDirection } from "./EntityEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Skill extends cc.Component {
    _movie: Movie;
    _playTimes: number = 1;

    static create(data: {
        parent: cc.Node;
        position: cc.Vec2;
        zIndex: number;
        skillId: number;
        direction: EntityDirection;
        playTimes?: number;
    }) {
        let node = new cc.Node();
        node.setPosition(data.position);
        node.zIndex = data.zIndex;
        data.parent.addChild(node);
        let skill = node.addComponent(Skill);
        if (typeof data.playTimes == "number") skill._playTimes = data.playTimes;
        skill.release(data.skillId, data.direction);
        return skill;
    }

    static playSound() {
        cc.resources.load("audio/skill", cc.AudioClip, (err, asset: cc.AudioClip) => {
            if (err) return;
            cc.audioEngine.playEffect(asset, false);
        })
    }

    onLoad() {
        this._movie = this.node.addComponent(Movie);

        (window as any).skill = this;
    }

    load(skillName: string) {
        let image = null;
        let json = null;
        cc.resources.load("movie/skill/" + skillName, cc.SpriteFrame, (error, asset) => {
            if (error) return;
            image = asset;
            this.loadComplete(image, json);
        });
        cc.resources.load("movie/skill/" + skillName, cc.JsonAsset, (error, asset) => {
            if (error) return;
            json = asset;
            this.loadComplete(image, json);
        });
    }

    loadComplete(image, json) {
        if (!image || !json) return;
        this._movie.atlasImage = image;
        this._movie.atlasJson = json;
        this._movie.playClip(json.name, this._playTimes);
        this._movie.eventBox.once(Movie.EventType.COMPLETE, this.node, this.node.destroy);
    }

    release(skillId: number, direction: EntityDirection) {
        let skillConfig: MovieSkillResConfig = ResConfig.movieSkill[skillId];
        let resInfo: MovieSkillResInfo = null;
        if (direction < 2) {
            for (let item of skillConfig.res) {
                if (item.direction == direction) {
                    resInfo = item;
                    break;
                } else if (item.direction < 2) {
                    resInfo = item;
                }
            }
        } else {
            for (let item of skillConfig.res) {
                if (item.direction == direction) {
                    resInfo = item;
                    break;
                } else if (item.direction > 1) {
                    resInfo = item;
                }
            }
        }
        if (resInfo.direction == direction) {
            this.node.scaleX = Math.abs(this.node.scaleX);
            this.node.x += resInfo.offset[0];
        } else {
            this.node.scaleX = -Math.abs(this.node.scaleX);
            this.node.x -= resInfo.offset[0];
        }
        this.node.y += resInfo.offset[1];
        if (typeof resInfo.offset[2] == "number") {
            this.node.zIndex += resInfo.offset[2];
        } else {
            this.node.zIndex += direction < EntityDirection.LEFT_DOWN ? -1: 1;
        }
        if (typeof resInfo.rotate == "number") {
            this.node.angle = -(resInfo.direction == direction ? resInfo.rotate : -resInfo.rotate);
        }
        this.load(resInfo.name);
    }
}
