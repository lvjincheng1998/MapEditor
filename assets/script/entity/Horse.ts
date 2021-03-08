import EventBox from "../component/EventBox";
import Movie from "../component/Movie";
import ResConfig from "../config/ResConfig";
import { EntityAction, EntityDirection, EntityEvent } from "./EntityEnum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Horse extends cc.Component {
    private _bodyMovie: Movie;
    private _head1Movie: Movie;
    private _head3Movie: Movie;
    
    private _horseConfig: MovieHorseResConfig;
    private _loadUuid: number = 0;
    private static _globalUuid = 0;

    public eventBox: EventBox = new EventBox();
    public static loadedIds: Set<number> = new Set();

    load(horseId: number) {
        let horseConfig = ResConfig.movieHorse[horseId];
        if (Horse.loadedIds.has(horseId)) {
            this.loadComplete(horseConfig);
            return;
        }
        this._loadUuid = Horse._globalUuid++;
        let loadUuid = this._loadUuid;
        let loadCount = 0;
        let resPaths = this.getResPaths(horseConfig);
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
                this.loadComplete(horseConfig);
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
                this.loadComplete(horseConfig);
            }
        });
    }

    loadComplete(horseConfig: MovieHorseResConfig) {
        Horse.loadedIds.add(horseConfig.id);
        this._horseConfig = horseConfig;
        for (let property in this._horseConfig) {
            if (property == "body") {
                if (!this._bodyMovie) this._bodyMovie = this.node.addComponent(Movie);
                this._bodyMovie.setZIndex(this._horseConfig[property].zIndex);
            }
            if (property == "head1") {
                if (!this._head1Movie) this._head1Movie = this.node.addComponent(Movie);
                this._head1Movie.setZIndex(this._horseConfig[property].zIndex);
            }
            if (property == "head3") {
                if (!this._head3Movie) this._head3Movie = this.node.addComponent(Movie);
                this._head3Movie.setZIndex(this._horseConfig[property].zIndex);
            }
        }
        console.log("horse load complete", this._horseConfig);
        this.eventBox.emit(EntityEvent.LOAD_COMPLETE);
    }

    setAction(action: EntityAction, direction: EntityDirection, playTimes: number) {
        let actionTag = null;
        if (action == EntityAction.RUN) {
            actionTag = 'r';
        }
        if (action == EntityAction.STAND || action == EntityAction.ATTACK || action == EntityAction.HIT) {
            actionTag = 's';
        }
        if (!actionTag) {
            if (this._bodyMovie) this._bodyMovie.hide();
            if (this._head1Movie) this._head1Movie.hide();
            if (this._head3Movie) this._head3Movie.hide();
            return;
        } 
        direction = direction < EntityDirection.LEFT_DOWN ? 1 : 3;
        let bodyResPath = this.getResPath(this._horseConfig, actionTag, direction, "body");
        if (bodyResPath) {
            this._bodyMovie.atlasImage = cc.resources.get(bodyResPath, cc.SpriteFrame); 
            this._bodyMovie.atlasJson = cc.resources.get(bodyResPath, cc.JsonAsset);
            this._bodyMovie.show();
            let clipName = this.getResName(this._horseConfig, actionTag, direction, "body"); 
            this._bodyMovie.playClip(clipName, playTimes);
        } else {
            this._bodyMovie.hide();
        } 
        let headResPath = this.getResPath(this._horseConfig, actionTag, direction, "head");
        if (direction == 1 && headResPath) {
            this._head1Movie.atlasImage = cc.resources.get(headResPath, cc.SpriteFrame); 
            this._head1Movie.atlasJson = cc.resources.get(headResPath, cc.JsonAsset);
            this._head1Movie.show();
            let clipName = this.getResName(this._horseConfig, actionTag, direction, "head"); 
            this._head1Movie.playClip(clipName, playTimes);
        } else {
            if (this._head1Movie) this._head1Movie.hide();
        } 
        if (direction == 3 && headResPath) {
            this._head3Movie.atlasImage = cc.resources.get(headResPath, cc.SpriteFrame); 
            this._head3Movie.atlasJson = cc.resources.get(headResPath, cc.JsonAsset);
            this._head3Movie.show();
            let clipName = this.getResName(this._horseConfig, actionTag, direction, "head"); 
            this._head3Movie.playClip(clipName, playTimes);
        } else {
            if (this._head3Movie) this._head3Movie.hide();
        } 
    }

    getResPaths(horseConfig: MovieHorseResConfig) {
        let resPaths = [];
        let actionTags = ['s', 'r'];
        let directions = [1, 3];    
        for (let direction of directions) {
            for (let actionTag of actionTags) {
                let bodyResPath = this.getResPath(horseConfig, actionTag, direction, "body");
                let headResPath = this.getResPath(horseConfig, actionTag, direction, "head");
                if (bodyResPath) resPaths.push(bodyResPath);
                if (headResPath) resPaths.push(headResPath);
            }
        }
        return resPaths;
    }

    getResPath(horseConfig: MovieHorseResConfig, actionTag: string, direction: number, part: string) {
        let resName = this.getResName(horseConfig, actionTag, direction, part);
        return resName ? "movie/horse/" + resName : "";
    }

    getResName(horseConfig: MovieHorseResConfig, actionTag: string, direction: number, part: string) {
        if (part == "body") {
            return "horse_" + horseConfig.id + '_' + direction + actionTag;
        }
        if (part == "head" && horseConfig[part + direction]) {
            return "horse_" + horseConfig.id + '_h_' + direction + actionTag;
        }
    }

    getOffset() {
        return this._horseConfig.offset;
    }

    destroy(): boolean {
        if (this._bodyMovie) this._bodyMovie.destroy();
        if (this._head1Movie) this._head1Movie.destroy();
        if (this._head3Movie) this._head3Movie.destroy();
        return super.destroy();
    }
}