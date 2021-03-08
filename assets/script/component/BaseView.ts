const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseView extends cc.Component {
    @property
    private _enableWidget: boolean = true;
    @property
    set enableWidget(value) {
        this._enableWidget = value;
        this._checkWidget();
    }
    get enableWidget() {
        return this._enableWidget;
    }
    @property
    private _enableBlockInputEvents: boolean = true;
    @property
    get enableBlockInputEvents() {
        return this._enableBlockInputEvents;
    }
    set enableBlockInputEvents(value) {
        this._enableBlockInputEvents = value;
        this._checkBlockInputEvents();
    }
    @property
    private _enableBgColor: boolean = true;
    @property
    get enableBgColor() {
        return this._enableBgColor;
    }
    set enableBgColor(value) {
        this._enableBgColor = value;
        this._renderBgColor();
    }
    @property
    private _bgColor: cc.Color = cc.color(0, 0, 0, 155);
    @property({
        visible: function() {
            return this.enableBgColor; 
        }
    })
    get bgColor() {
        return this._bgColor;
    }
    set bgColor(value) {
        this._bgColor = value;
        this._renderBgColor();
    }

    onLoad() {
        this._checkWidget();
        this._checkBlockInputEvents();
        this._renderBgColor();
    }

    private _checkWidget() {
        if (CC_EDITOR) return;
        if (this.enableWidget) {
            let widget = this.node.getComponent(cc.Widget);
            if (!widget) {
                widget = this.node.addComponent(cc.Widget);
                widget.left = 0;
                widget.right = 0;
                widget.top = 0;
                widget.bottom = 0;
                widget.isAlignLeft = true;
                widget.isAlignRight = true;
                widget.isAlignTop = true;
                widget.isAlignBottom = true;
                widget.updateAlignment();
            }
        } else {
            this.node.removeComponent(cc.Widget);
        }
    }

    private _checkBlockInputEvents() {
        if (CC_EDITOR) return;
        if (this.enableBlockInputEvents) {
            let blockInputEvents = this.node.getComponent(cc.BlockInputEvents);
            if (!blockInputEvents) {
                this.node.addComponent(cc.BlockInputEvents);
            }
        } else {
            this.node.removeComponent(cc.BlockInputEvents);
        }
    }

    private _renderBgColor() {
        if (CC_EDITOR) return;
        if (this.enableBgColor) {
            let graphics = this.node.getComponent(cc.Graphics);
            if (!graphics) graphics = this.node.addComponent(cc.Graphics);
            graphics.clear();
            graphics.fillColor = this.bgColor;
            graphics.fillRect(-this.node.width / 2, -this.node.height / 2, this.node.width, this.node.height);
        } else {
            this.node.removeComponent(cc.Graphics);
        }
    }
}