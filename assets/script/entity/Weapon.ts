import EventBox from "../component/EventBox";
import Movie from "../component/Movie";
import ResConfig from "../config/ResConfig";
import { EntityAction, EntityDirection, EntityEvent } from "./EntityEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Weapon extends cc.Component {
    private _movie: Movie;
    
    private _weaponConfig: MovieWeaponResConfig;
    private _loadUuid: number = 0;
    private static _globalUuid = 0;

    public eventBox: EventBox = new EventBox();
    public static loadedIds: Set<number> = new Set();

    load(weaponId: number) {
        let weaponConfig = ResConfig.movieWeapon[weaponId];
        if (Weapon.loadedIds.has(weaponId)) {
            this.loadComplete(weaponConfig);
            return;
        }
        this._loadUuid = Weapon._globalUuid++;
        let loadUuid = this._loadUuid;
        let loadCount = 0;
        let resPaths = this.getResPaths(weaponConfig);
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
                this.loadComplete(weaponConfig);
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
                this.loadComplete(weaponConfig);
            }
        });
    }

    loadComplete(weaponConfig: MovieWeaponResConfig) {
        Weapon.loadedIds.add(weaponConfig.id);
        this._weaponConfig = weaponConfig;
        if (!this._movie) this._movie = this.node.addComponent(Movie);
        this._movie.setZIndex(11);
        console.log("weapon load complete", this._weaponConfig);
        this.eventBox.emit(EntityEvent.LOAD_COMPLETE);
    }

    setAction(action: EntityAction, direction: EntityDirection, onHorse: boolean, playTimes: number) {
        let actionTag = null;
        if (action == EntityAction.STAND) {
            actionTag = onHorse ? 'p' : 's';
        }
        if (action == EntityAction.RUN) {
            actionTag = onHorse ? 'o' : 'r';
        }
        if (action == EntityAction.ATTACK || action == EntityAction.HIT) {
            actionTag = onHorse ? 'i' : 'a';
        }
        if (action == EntityAction.DIE) {
            actionTag = 'a';
        }
        if (!actionTag) {
            if (this._movie) this._movie.hide();
            return;
        } 
        direction = direction < EntityDirection.LEFT_DOWN ? 1 : 3;
        let resPath = this.getResPath(this._weaponConfig, actionTag, direction);
        if (resPath) {
            this._movie.atlasImage = cc.resources.get(resPath, cc.SpriteFrame); 
            this._movie.atlasJson = cc.resources.get(resPath, cc.JsonAsset);
            this._movie.show();
            let clipName = action == EntityAction.STAND || action == EntityAction.RUN 
                ? this.getResName(this._weaponConfig, actionTag, direction) : action; 
            if (clipName == "hit") this._movie.atlasJson.json.mc.hit.frameRate = 6;
            this._movie.playClip(clipName, playTimes);
        } else {
            this._movie.hide();
        } 
    }

    getResPaths(weaponConfig: MovieWeaponResConfig) {
        let resPaths = [];
        let actionTags = null;
        switch (weaponConfig.type) {
            case 1:
                actionTags = "srapoi";
                break;
            case 2:
                actionTags = "apoi";
                break;
        }
        let directions = [1, 3];    
        for (let direction of directions) {
            for (let actionTag of actionTags) {
                let resPath = this.getResPath(weaponConfig, actionTag, direction);
                if (resPath) resPaths.push(resPath);
            }
        }
        return resPaths;
    }

    getResPath(weaponConfig: MovieWeaponResConfig, actionTag: string, direction: number) {
        let resName = this.getResName(weaponConfig, actionTag, direction);
        return resName ? "movie/weapon/" + resName : "";
    }

    getResName(weaponConfig: MovieWeaponResConfig, actionTag: string, direction: number) {
        return weaponConfig.prefix + '_' + direction + actionTag;
    }

    setOffset(offset: number[]) {
        this._movie.setOffset(offset[0], offset[1]);
    }

    destroy(): boolean {
        if (this._movie) this._movie.destroy();
        return super.destroy();
    }
}