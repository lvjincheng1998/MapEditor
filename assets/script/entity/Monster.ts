import EventBox from "../component/EventBox";
import MapGuider, { MapRectType } from "../component/MapGuider";
import Movie from "../component/Movie";
import ResConfig from "../config/ResConfig";
import { EntityAction, EntityDirection, EntityEvent } from "./EntityEnum";
import Role from "./Role";
import Skill from "./Skill";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Monster extends cc.Component {
    bodyId = 1;
    bodyComp: Body;
    basePoint: cc.Vec2;
    activeRange: number;

    action: EntityAction = EntityAction.STAND;
    direction: EntityDirection = EntityDirection.RIGHT_UP;

    movePath: any[] = [];
    moveing: boolean = false;
    attacking: boolean = false;
    hurting: boolean = false;
    dead: boolean = false;

    initialized: boolean = false;

    eventBox: EventBox = new EventBox();

    static EventType = {
        
    }

    static monsters: Map<string, Monster> = new Map();

    static create(data?: {position?: cc.Vec2, parent?: cc.Node, bodyId?: number, direction?: EntityDirection, activeRange: number}): Monster {
        let node = new cc.Node();
        let monster = node.addComponent(Monster);
        if (typeof data.bodyId == "number") {
            monster.bodyId = data.bodyId;
        }
        if (typeof data.direction == "number") {
            monster.direction = data.direction;
        }
        if (typeof data.activeRange == "number") {
            monster.activeRange = data.activeRange;
        }
        if (data.position) {
            monster.basePoint = data.position;
            node.setPosition(data.position);
            MapGuider.ins.updateCamera();
        }
        if (data.parent) {
            data.parent.addChild(node);
        }
        return monster;
    }

    onLoad() {
        Monster.monsters.set(this.uuid, this);
        this.load();

        this.schedule(this.ai, 1 + 1 * Math.random());
    }

    onDestroy() {
        Monster.monsters.delete(this.uuid);
    }

    ai() {
        if (this.initialized && !this.attacking && !this.hurting && !this.dead) {
            Role.roles.forEach(role => {
                if (role.node.getPosition().sub(this.basePoint).mag() < this.activeRange) {
                    let pointer = role.node.getPosition().sub(this.node.getPosition());
                    let distance = pointer.mag();
                    if (distance > 60) {
                        let vec = pointer.mul((distance - (60 - Math.random() * 30)) / distance);
                        let endPos = this.node.getPosition().addSelf(vec);
                        this.movePath = MapGuider.ins.getPath(this.node.getPosition(), endPos);
                    } else {
                        this.attack();
                        role.hit();
                    }
                } else {
                    this.movePath = MapGuider.ins.getPath(this.node.getPosition(), this.basePoint);
                }
            });
        }
    }

    update(dt: number) {
        if (!this.initialized) return;
        if (!this.attacking && !this.hurting && !this.dead) {
            if (this.movePath.length > 0) {
                this.moveing = true;
                let nextPosition = MapGuider.getNextPosition(this.node.getPosition(), this.movePath, 280, dt);
                let direction = null;
                let deltaX = nextPosition.x - this.node.x;
                let deltaY = nextPosition.y - this.node.y;
                if (deltaX > 0) {
                    if (deltaY > 0) {
                        direction = EntityDirection.RIGHT_UP;
                    } 
                    if (deltaY < 0) {
                        direction = EntityDirection.RIGHT_DOWN;
                    }
                    if (deltaY == 0) {
                        if (this.direction == EntityDirection.LEFT_UP || this.direction == EntityDirection.RIGHT_UP) {
                            direction = EntityDirection.RIGHT_UP;
                        } else {
                            direction = EntityDirection.RIGHT_DOWN;
                        }
                    }
                }
                if (deltaX < 0) {
                    if (deltaY > 0) {
                        direction = EntityDirection.LEFT_UP;
                    } 
                    if (deltaY < 0) {
                        direction = EntityDirection.LEFT_DOWN;
                    }
                    if (deltaY == 0) {
                        if (this.direction == EntityDirection.LEFT_UP || this.direction == EntityDirection.RIGHT_UP) {
                            direction = EntityDirection.LEFT_UP;
                        } else {
                            direction = EntityDirection.LEFT_DOWN;
                        }
                    }
                }
                if (deltaX == 0) {
                    if (deltaY > 0) {
                        if (this.direction == EntityDirection.LEFT_UP || this.direction == EntityDirection.LEFT_DOWN) {
                            direction = EntityDirection.LEFT_UP;
                        } else {
                            direction = EntityDirection.RIGHT_UP;
                        }
                    } 
                    if (deltaY < 0) {
                        if (this.direction == EntityDirection.LEFT_UP || this.direction == EntityDirection.LEFT_DOWN) {
                            direction = EntityDirection.LEFT_DOWN;
                        } else {
                            direction = EntityDirection.RIGHT_DOWN;
                        }
                    }
                    if (deltaY == 0) {
                        direction = this.direction;
                    }
                }
                this.run(direction);
                this.node.setPosition(nextPosition);
            } else {
                this.moveing = false;
                this.stand();
            }
        }
        if (MapGuider.ins.getRectType(this.node.x, this.node.y) == MapRectType.BLUE) {
            this.node.opacity = 125;
        } else {
            this.node.opacity = 255;
        }
        if (MapGuider.ins.basePoint) {
            this.node.zIndex = MapGuider.ins.basePoint.y - this.node.y;
        }
    }

    load() {
        this.bodyComp = this.node.addComponent(Body);
        this.bodyComp.eventBox.once(EntityEvent.LOAD_COMPLETE, this, this.loadComplete);
        this.bodyComp.load(this.bodyId);
    }

    loadComplete() {
        this.initialized = true;
        this.bodyComp.eventBox.on(Movie.EventType.COMPLETE, this, () => {
            if (this.action == EntityAction.ATTACK) {
                this.attacking = false;
            }
            if (this.action == EntityAction.HIT) {
                this.hurting = false;
            }
        });
        this.setDirection(this.direction);
        this.setAction(this.action, 0, true);
    }

    setDirection(direction: EntityDirection) {
        this.direction = direction;
        if (direction == EntityDirection.LEFT_UP || direction == EntityDirection.LEFT_DOWN) {
            this.node.scaleX = -Math.abs(this.node.scaleX);
        } else if (direction == EntityDirection.RIGHT_UP || direction == EntityDirection.RIGHT_DOWN) {
            this.node.scaleX = Math.abs(this.node.scaleX);
        }
    }

    setAction(action: EntityAction, playTimes: number, passSameActionCheck?: boolean): boolean {
        if (!passSameActionCheck && this.action == action) {
            return false;
        }
        this.action = action;
        if (this.bodyComp) {
            this.bodyComp.setAction(this.action, this.direction, playTimes);
        }
        return true;
    }

    stand() {
        this.setAction(EntityAction.STAND, 0);
    }

    run(direction: EntityDirection) {
        if (
            (direction < EntityDirection.LEFT_DOWN && this.direction < EntityDirection.LEFT_DOWN) ||
            (direction > EntityDirection.RIGHT_UP && this.direction > EntityDirection.RIGHT_UP)
        ) {
            this.setDirection(direction);
            this.setAction(EntityAction.RUN, 0);
        } else {
            this.setDirection(direction);
            this.setAction(EntityAction.RUN, 0, true);
        }
    }

    attack() {
        this.movePath = [];
        if (this.setAction(EntityAction.ATTACK, 1)) {
            this.attacking = true;
            Skill.playSound();
        }
    }

    hit() {
        this.movePath = [];
        this.attacking = false;
        this.hurting = true;
        this.setAction(EntityAction.HIT, 1, true);
    }

    die() {
        this.movePath = [];
        this.attacking = false;
        this.dead = true;
        this.setAction(EntityAction.DIE, 0, true);
    }
}

class Body extends cc.Component {
    private _movie: Movie;
    
    private _bodyConfig: MovieBodyResConfig;
    private _loadUuid: number = 0;
    private static _globalUuid = 0;

    public eventBox: EventBox = new EventBox();
    public static loadedIds: Set<number> = new Set();

    load(bodyId: number) {
        let bodyConfig = ResConfig.movieMonster[bodyId];
        if (Body.loadedIds.has(bodyId)) {
            this.loadComplete(bodyConfig);
            return;
        }
        this._loadUuid = Body._globalUuid++;
        let loadUuid = this._loadUuid;
        let loadCount = 0;
        let resPaths = this.getResPaths(ResConfig.movieMonster[bodyId]);
        cc.resources.load(resPaths, cc.SpriteFrame, (error) => {
            if (loadUuid != this._loadUuid) {
                return;
            }
            if (error) {
                console.error(error);
                return;
            }
            loadCount++;
            if (loadCount == 2) {
                this.loadComplete(bodyConfig);
            }
        });
        cc.resources.load(resPaths, cc.JsonAsset, (error) => {
            if (loadUuid != this._loadUuid) {
                return;
            }
            if (error) {
                console.error(error);
                return;
            }
            loadCount++;
            if (loadCount == 2) {
                this.loadComplete(bodyConfig);
            }
        });
    }

    loadComplete(bodyConfig: MovieBodyResConfig) {
        Body.loadedIds.add(bodyConfig.id);
        this._bodyConfig = bodyConfig;
        if (!this._movie) {
            this._movie = this.node.addComponent(Movie);
            this._movie.eventBox = this.eventBox;
        }
        this._movie.setZIndex(10);
        console.log("body load complete", this._bodyConfig);
        this.eventBox.emit(EntityEvent.LOAD_COMPLETE);
    }

    setAction(action: EntityAction, direction: EntityDirection, playTimes: number) {
        let actionTag = null;
        if (action == EntityAction.STAND) {
            actionTag = 's';
        }
        else if (action == EntityAction.RUN) {
            actionTag = 'r';
        }
        else if (action == EntityAction.ATTACK || action == EntityAction.HIT || action == EntityAction.DIE) {
            actionTag = 'a';
        }
        if (!actionTag) {
            if (this._movie) this._movie.hide();
            return;
        } 
        direction = direction < EntityDirection.LEFT_DOWN ? 1 : 3;
        let resPath = this.getResPath(this._bodyConfig, actionTag, direction);
        if (resPath) {
            this._movie.atlasImage = cc.resources.get(resPath, cc.SpriteFrame); 
            this._movie.atlasJson = cc.resources.get(resPath, cc.JsonAsset);
            this._movie.show();
            let clipName = action == EntityAction.STAND || action == EntityAction.RUN ? this.getResName(this._bodyConfig, actionTag, direction) : action; 
            if (clipName == "hit") this._movie.atlasJson.json.mc.hit.frameRate = 6;
            this._movie.playClip(clipName, playTimes);
        } else {
            this._movie.hide();
        } 
    }

    getResPaths(bodyConfig: MovieBodyResConfig) {
        let resPaths = [];
        let actionTags = "sra";
        let directions = [1, 3];    
        for (let direction of directions) {
            for (let actionTag of actionTags) {
                let resPath = this.getResPath(bodyConfig, actionTag, direction);
                if (resPath) resPaths.push(resPath);
            }
        }
        return resPaths;
    }

    getResPath(bodyConfig: MovieBodyResConfig, actionTag: string, direction: number) {
        let resName = this.getResName(bodyConfig, actionTag, direction);
        return resName ? "movie/monster/" + resName : "";
    }

    getResName(bodyConfig: MovieBodyResConfig, actionTag: string, direction: number) {
        return bodyConfig.prefix + '_' + direction + actionTag;
    }
    
    setOffset(offset: number[]) {
        this._movie.setOffset(offset[0], offset[1]);
    }
}