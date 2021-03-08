const {ccclass, property} = cc._decorator;

@ccclass
export default class glow_shader extends cc.Component {
    material: cc.MaterialVariant = null;
    total_time: number = 0;
    @property
    _scan_radius: number = 0.01;
    @property
    get scan_radius() {
        return this._scan_radius;
    }
    set scan_radius(value) {
        this._scan_radius = value;
        CC_EDITOR && this.updateMaterial();
    }
    @property
    _glow_color: cc.Color = cc.color(255, 0, 0, 255);
    @property
    get glow_color() {
        return this._glow_color;
    }
    set glow_color(value) {
        this._glow_color = value;
        CC_EDITOR && this.updateMaterial();
    }

    onLoad() {
        this.updateMaterial();
    }

    updateMaterial() {
        this.material = this.node.getComponent(cc.Sprite).getMaterial(0);
        this.material.setProperty("scan_radius", this.scan_radius);
        this.material.setProperty("glow_color", this.glow_color);
    }

    update(dt: number) {
        this.total_time += dt;
        this.material.setProperty("total_time", this.total_time);
    }
}
