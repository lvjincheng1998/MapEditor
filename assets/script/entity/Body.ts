import EventBox from "../component/EventBox";
import Movie from "../component/Movie";
import ResConfig from "../config/ResConfig";
import { EntityAction, EntityDirection, EntityEvent } from "./EntityEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Body extends cc.Component {
    private _movie: Movie;
    
    private _bodyConfig: MovieBodyResConfig;
    private _loadUuid: number = 0;
    private static _globalUuid = 0;

    public eventBox: EventBox = new EventBox();
    public static loadedIds: Set<number> = new Set();

    load(bodyId: number) {
        let bodyConfig = ResConfig.movieBody[bodyId];
        if (Body.loadedIds.has(bodyId)) {
            this.loadComplete(bodyConfig);
            return;
        }
        this._loadUuid = Body._globalUuid++;
        let loadUuid = this._loadUuid;
        let loadCount = 0;
        let resPaths = this.getResPaths(ResConfig.movieBody[bodyId]);
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

    setAction(action: EntityAction, direction: EntityDirection, onHorse: boolean, playTimes: number) {
        let actionTag = null;
        switch (this._bodyConfig.type) {
            case 1:
                if (action == EntityAction.STAND) {
                    actionTag = onHorse ? 'p' : 's';
                }
                else if (action == EntityAction.RUN) {
                    actionTag = onHorse ? 'o' : 'r';
                }
                else if (action == EntityAction.ATTACK || action == EntityAction.HIT) {
                    actionTag = onHorse ? 'i' : 'a';
                }
                else if (action == EntityAction.DIE) {
                    actionTag = 'a';
                }
                break;
            case 2:
                if (action == EntityAction.STAND) {
                    actionTag = 'p';
                }
                else if (action == EntityAction.RUN) {
                    actionTag = 'o';
                }
                else if (action == EntityAction.ATTACK || action == EntityAction.HIT) {
                    actionTag = 'i';
                }
                else if (action == EntityAction.DIE) {
                    actionTag = 'a';
                }
                break;
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
        let actionTags = null;
        switch (bodyConfig.type) {
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
                let resPath = this.getResPath(bodyConfig, actionTag, direction);
                if (resPath) resPaths.push(resPath);
            }
        }
        return resPaths;
    }

    getResPath(bodyConfig: MovieBodyResConfig, actionTag: string, direction: number) {
        let resName = this.getResName(bodyConfig, actionTag, direction);
        return resName ? "movie/body/" + resName : "";
    }

    getResName(bodyConfig: MovieBodyResConfig, actionTag: string, direction: number) {
        return bodyConfig.prefix + '_' + direction + actionTag;
    }

    
    setOffset(offset: number[]) {
        this._movie.setOffset(offset[0], offset[1]);
    }
}
