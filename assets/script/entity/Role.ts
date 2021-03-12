import EventBox from "../component/EventBox";
import MapGuider, { MapRectType } from "../component/MapGuider";
import Movie from "../component/Movie";
import Body from "./Body";
import Ellipse from "./Ellipse";
import { EntityAction, EntityDirection, EntityEvent } from "./EntityEnum";
import Horse from "./Horse";
import Monster from "./Monster";
import Skill from "./Skill";
import Weapon from "./Weapon";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Role extends cc.Component {
    bodyId = 1;
    weaponId = 300;
    horseId = 0;
    bodyComp: Body;
    weaponComp: Weapon;
    horseComp: Horse;

    action: EntityAction = EntityAction.STAND;
    direction: EntityDirection = EntityDirection.RIGHT_UP;

    movePath: any[] = [];
    moveing: boolean = false;
    attacking: boolean = false;
    hurting: boolean = false;
    dead: boolean = false;

    initialized: boolean = false;

    eventBox: EventBox = new EventBox();

    static roles: Map<string, Role> = new Map();

    static EventType = {
        WEAPON_CHANGE: "WEAPON_CHANGE" 
    }

    static createRole(data?: {position?: cc.Vec2, parent?: cc.Node, bodyId?: number, weaponId?: number, horseId?: number; direction?: EntityDirection}): Role {
        let node = new cc.Node();
        let role = node.addComponent(Role);
        if (typeof data.bodyId == "number") {
            role.bodyId = data.bodyId;
        }
        if (typeof data.weaponId == "number") {
            role.weaponId = data.weaponId;
        }
        if (typeof data.horseId == "number") {
            role.horseId = data.horseId;
        }
        if (typeof data.direction == "number") {
            role.direction = data.direction;
        }
        if (data.position) {
            node.setPosition(data.position);
            MapGuider.ins.updateCamera();
        }
        if (data.parent) {
            data.parent.addChild(node);
        }
        return role;
    }

    onLoad() {
        Role.roles.set(this.uuid, this);
        this.load();
    }

    onDestroy() {
        Role.roles.delete(this.uuid);
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
        MapGuider.ins.updateCamera();
    }

    load() {
        let totalCount = 0;
        let completeCount = 0;
        if (this.bodyId) {
            totalCount++;
            this.bodyComp = this.node.addComponent(Body);
            this.bodyComp.eventBox.once(EntityEvent.LOAD_COMPLETE, this, () => {
                completeCount++;
                if (totalCount == completeCount) this.loadComplete();
            });
            this.bodyComp.load(this.bodyId);
        }
        if (this.weaponId) {
            totalCount++;
            this.weaponComp = this.node.addComponent(Weapon);
            this.weaponComp.eventBox.once(EntityEvent.LOAD_COMPLETE, this, () => {
                completeCount++;
                if (totalCount == completeCount) this.loadComplete();
            });
            this.weaponComp.load(this.weaponId);
        }
        if (this.horseId) {
            totalCount++;
            this.horseComp = this.node.addComponent(Horse);
            this.horseComp.eventBox.once(EntityEvent.LOAD_COMPLETE, this, () => {
                completeCount++;
                if (totalCount == completeCount) this.loadComplete();
            });
            this.horseComp.load(this.horseId);
        }
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
        if (this.weaponId) {
            this.eventBox.emit(Role.EventType.WEAPON_CHANGE, [this.weaponId]);
        }
    }

    reloadBody(bodyId: number) {
        this.bodyComp.eventBox.off(EntityEvent.LOAD_COMPLETE);
        this.bodyComp.eventBox.once(EntityEvent.LOAD_COMPLETE, this, () => {
            this.bodyId = this.bodyId;
            if ([EntityAction.STAND, EntityAction.RUN].includes(this.action)) this.setAction(this.action, 0, true);
        });
        this.bodyComp.load(bodyId);
    }

    reloadWeapon(weaponId: number) {
        if (!this.weaponComp) this.weaponComp = this.node.addComponent(Weapon);
        let loadComplete = () => {
            this.weaponId = weaponId;
            this.eventBox.emit(Role.EventType.WEAPON_CHANGE, [weaponId]);
            if ([EntityAction.STAND, EntityAction.RUN].includes(this.action)) this.setAction(this.action, 0, true);
        };
        if (weaponId) {
            this.weaponComp.eventBox.off(EntityEvent.LOAD_COMPLETE);
            this.weaponComp.eventBox.once(EntityEvent.LOAD_COMPLETE, this, loadComplete);
            this.weaponComp.load(weaponId);
        } else {
            this.weaponComp.destroy();
            this.weaponComp = null;
            loadComplete();
        }
    }

    reloadHorse(horseId: number) {
        if (!this.horseComp) this.horseComp = this.node.addComponent(Horse);
        let loadComplete = () => {
            this.horseId = horseId;
            if ([EntityAction.STAND, EntityAction.RUN].includes(this.action)) this.setAction(this.action, 0, true);
        };
        if (horseId) {
            this.horseComp.eventBox.off(EntityEvent.LOAD_COMPLETE);
            this.horseComp.eventBox.once(EntityEvent.LOAD_COMPLETE, this, loadComplete);
            this.horseComp.load(horseId);
        } else {
            this.horseComp.destroy();
            this.horseComp = null;
            loadComplete();
        }
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
        if (this.horseComp) {
            this.horseComp.setAction(this.action, this.direction, playTimes);
        }
        if (this.bodyComp) {
            this.bodyComp.setAction(this.action, this.direction, this.horseId ? true : false, playTimes);
            if (this.horseComp) {
                let offset = this.horseComp.getOffset();
                if (offset.length == 4) {
                    this.direction < EntityDirection.LEFT_DOWN ? this.bodyComp.setOffset([offset[0], offset[1]]) : this.bodyComp.setOffset([offset[2], offset[3]]);
                } else {
                    this.bodyComp.setOffset(offset);
                }
            }
        }
        if (this.weaponComp) {
            this.weaponComp.setAction(this.action, this.direction, this.horseId ? true : false, playTimes);
            if (this.horseComp) {
                let offset = this.horseComp.getOffset();
                if (offset.length == 4) {
                    this.direction < EntityDirection.LEFT_DOWN ? this.weaponComp.setOffset([offset[0], offset[1]]) : this.weaponComp.setOffset([offset[2], offset[3]]);
                } else {
                    this.weaponComp.setOffset(offset);
                }
            }
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

    attack(skillId: number) {
        this.movePath = [];
        if (this.setAction(EntityAction.ATTACK, 1)) {
            this.attacking = true;
            if (skillId == 0) {
                Skill.playSound();
            }
            if ([1, 2, 4, 5, 7, 8, 10, 11].includes(skillId)) {
                let skill = Skill.create({
                    parent: MapGuider.ins.node,
                    position: this.node.getPosition(),
                    zIndex: this.node.zIndex, 
                    skillId: skillId,
                    direction: this.direction
                });
                if ([1, 4, 7, 10].includes(skillId)) {
                    Skill.playSound();
                    skill._movie.eventBox.on(Movie.EventType.FRAME_EVENT, this, () => {
                        let frameIndex = skill._movie.getFrameIndex();
                        if (frameIndex == 6) {
                            Monster.monsters.forEach(monster => {
                                if (monster.node.getPosition().sub(this.node.getPosition()).mag() < 100) {
                                    monster.hit();
                                }
                            });
                        }
                    });
                }
                if ([2, 5, 8, 11].includes(skillId)) {
                    skill._movie.eventBox.on(Movie.EventType.FRAME_EVENT, this, () => {
                        let frameIndex = skill._movie.getFrameIndex();
                        if (frameIndex == 0 || (frameIndex == 7 && skillId == 2)) {
                            Skill.playSound();
                        }
                        if (skillId == 2 && (frameIndex == 3 || frameIndex == 7)) {
                            Monster.monsters.forEach(monster => {
                                if (monster.node.getPosition().sub(this.node.getPosition()).mag() < 100) {
                                    monster.hit();
                                }
                            });
                            return;
                        }
                        if (frameIndex == 6) {
                            Monster.monsters.forEach(monster => {
                                if (monster.node.getPosition().sub(this.node.getPosition()).mag() < 100) {
                                    monster.hit();
                                }
                            });
                        }
                    });
                }
            } 
            if ([3, 6, 9, 12].includes(skillId)) {
                let targetDirection = this.direction;
                let targetPosition = this.node.getPosition();
                let ellipseWidth = 300;
                let ellipseHeight = 200;
                let ellipse = Ellipse.create({
                    width: ellipseWidth,
                    height: ellipseHeight,
                    position: this.node.getPosition(),
                    parent: this.node.parent,
                    rangeYHandler: (rangeY: number[]) => {
                        rangeY[1] += 18;
                        return rangeY;
                    }
                });
                let randomXY = [];
                for (let i = 0; i < 36; i++) {
                    let x = -ellipseWidth / 2 + Math.ceil(ellipseWidth * Math.random());
                    let rangeY = ellipse.getEllipseRangeY(x);
                    let y = rangeY[0] + (rangeY[1] - rangeY[0]) * Math.random();
                    randomXY.push(Math.round(x));
                    randomXY.push(Math.round(y));
                }
                let delayTime = 0;
                while (randomXY.length > 0) {
                    let randomY = randomXY.pop();
                    let randomX = randomXY.pop();
                    let isEnd = randomXY.length == 0;
                    this.scheduleOnce(() => {
                        let position = targetPosition.add(cc.v2(randomX, randomY));
                        Skill.create({
                            parent: MapGuider.ins.node,
                            position: position,
                            zIndex: MapGuider.ins.basePoint.y - position.y, 
                            skillId: skillId,
                            direction: targetDirection
                        });
                        Skill.playSound();
                        Monster.monsters.forEach(monster => {
                            if (monster.node.getPosition().sub(position).mag() < 100) {
                                monster.hit();
                            }
                        });
                        if (isEnd) {
                            cc.tween(ellipse.node).sequence(cc.fadeOut(0.5), cc.callFunc(() => {
                                ellipse.node.destroy();
                            })).start();
                        }
                    }, delayTime += 0.1);
                }
            }
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