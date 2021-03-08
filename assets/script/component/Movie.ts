import EventBox from "./EventBox";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Movie extends cc.Component {
    static EventType: {
        START: string;
        LOOP_START: string;
        LOOP_COMPLETE: string; 
        COMPLETE: string;
        FRAME_EVENT: string;
    } = {
        START: "START",
        LOOP_START: "LOOP_START",
        LOOP_COMPLETE: "LOOP_COMPLETE",
        COMPLETE: "COMPLETE",
        FRAME_EVENT: "FRAME_EVENT"
    }

    @property(cc.SpriteFrame)
    atlasImage: cc.SpriteFrame = null;
    @property(cc.JsonAsset)
    atlasJson: cc.JsonAsset = null;
    @property
    defaultClip: string = "";
    @property
    playOnload: boolean = false;

    public eventBox: EventBox = new EventBox();

    private _offset: cc.Vec2 = cc.v2(0, 0);
    private _maskNode: cc.Node = null;
    private _spriteNode: cc.Node = null;
    private _spriteComp: cc.Sprite = null;
    private _clipName: string = null;
    private _lastFrameIndex: number = 0;
    private _frameIndex: number = 0;
    private _frameInfos: {res: string, x: number, y: number}[] = null;
    private _frameRate: number = 0;
    private _frameResInfos: {x: number, y: number, w: number, h: number}[] = null;
    private _playTimes: number = 0;
    private _playCount: number = 0;
    private _playComplete: boolean = true;
    private _playing: boolean = false;
    private _currentTime: number = 0;
    private _autoUpdate: boolean = true;
    private _hasMaskShader: boolean = false;
    static _material: cc.Material = null;

    private _setFrameIndex(frameIndex: number) {
        if (frameIndex == 0) {
            this._lastFrameIndex = -1;
            this._currentTime = 0;
        } else {
            this._lastFrameIndex = this._frameIndex;
        }
        this._frameIndex = frameIndex
    }

    setAutoUpdate(autoUpdate: boolean) {
        this._autoUpdate = autoUpdate;
    }

    onLoad() {
        this._maskNode = new cc.Node("mask_node");
        this._maskNode.setAnchorPoint(0, 1);
        this.node.addChild(this._maskNode);
        this._spriteNode = new cc.Node("sprite_node");
        this._spriteNode.setAnchorPoint(0, 1);
        this._spriteComp = this._spriteNode.addComponent(cc.Sprite);
        this._maskNode.addChild(this._spriteNode);
        if (this.playOnload) {
            if (this.defaultClip) {
                this.playClip(this.defaultClip, 0);
            } else {
                for (let key in this.atlasJson.json.mc) {
                    this.playClip(key, 0);
                    break;
                }
            }
        }
        if (Movie._material && !CC_JSB) {
            this.setMaskShader();
        } else {
            this._maskNode.addComponent(cc.Mask);
        }
    }

    /**
     * 如果需要使用Shader做遮罩，需要在使用该组件前执行一次该函数
     * @param material 遮罩材质
     */
     static initMaskShader(material: cc.Material) {
        Movie._material = material;
    }

    setMaskShader() {
        this._spriteComp.getComponent(cc.Sprite).setMaterial(0, Movie._material);
        this._hasMaskShader = true;
    }

    onDestroy() {
        if (this._maskNode.isValid) this._maskNode.destroy();
    }

    update(dt: number) {
        if (!this._autoUpdate || !this._playing) return;
        this._currentTime += dt;
        let deltaFrameCount = Math.floor(this._currentTime * this._frameRate) - this._lastFrameIndex;
        for (let i = 0; i < deltaFrameCount; i++) {
            this.updateClipFrame();
        }
    }

    updateClipFrame() {
        if (this._playComplete || !this._playing) return;

        if (this._frameIndex >= this._frameInfos.length) {
            this._playCount++;
            if (this._playTimes == 0) {
                this._emitEvent(Movie.EventType.LOOP_COMPLETE);
                this._setFrameIndex(0);
            }
            if (this._playTimes > 0) {
                if (this._playCount < this._playTimes) {
                    this._emitEvent(Movie.EventType.LOOP_COMPLETE);
                    this._setFrameIndex(0);
                } else {
                    this._emitEvent(Movie.EventType.COMPLETE);
                    this._playComplete = true;
                    return;
                }
            }
        }

        let frameInfo = this._frameInfos[this._frameIndex];
        let frameResInfo = this._frameResInfos[frameInfo.res];
        this._maskNode.setPosition(frameInfo.x + this._offset.x, -frameInfo.y + this._offset.y);
        this._maskNode.setContentSize(frameResInfo.w, frameResInfo.h);
        this._spriteNode.setPosition(-frameResInfo.x, frameResInfo.y);
        this._spriteComp.spriteFrame = this.atlasImage;

        if (this._hasMaskShader) {
            let material = this._spriteComp.getMaterial(0);
            let ms = this.atlasImage.getOriginalSize();
            let mw = ms.width;
            let mh = ms.height;
            let info = frameResInfo;
            material.setProperty("rangeX", new Float32Array([info.x / mw, (info.x + info.w) / mw]));
            material.setProperty("rangeY", new Float32Array([info.y / mh, (info.y + info.h) / mh]));
        }

        if (this._frameIndex == 0) {
            this._playCount > 0 ? this._emitEvent(Movie.EventType.LOOP_START) : this._emitEvent(Movie.EventType.START);
        }
        this._emitEvent(Movie.EventType.FRAME_EVENT);
        this._setFrameIndex(this._frameIndex + 1);
    }

    private _emitEvent(eventType: string, args?: any[]) {
        try {
            this.eventBox.emit(eventType, args);
        } catch (e) {
            console.error(e);
        }
    }

    playClip(clipName: string, playTimes: number = 0) {
        this._clipName = clipName;
        this._setFrameIndex(0);
        this._frameInfos = this.atlasJson.json.mc[clipName].frames;
        this._frameRate = this.atlasJson.json.mc[clipName].frameRate;
        this._frameResInfos = this.atlasJson.json.res;
        this._playTimes = playTimes;
        this._playCount = 0;
        this._playComplete = this._frameInfos.length > 0 ? false : true;
        this._playing = this._frameInfos.length > 0 ? true : false;
    }

    getClipName() {
        return this._clipName;
    }

    getFrameIndex() {
        return this._frameIndex;
    }

    pause() {
        this._playing = false;
    }

    resume() {
        this._playing = true;
    }

    hide() {
        this._maskNode.active = false;
    }

    show() {
        this._maskNode.active = true;
    }

    setZIndex(zIndex: number) {
        this._maskNode.zIndex = zIndex;
    }

    setOffset(x: number, y: number) {
        this._offset.x = x;
        this._offset.y = y;
    }
}