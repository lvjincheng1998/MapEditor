export default class EventBox {
    private eventMap: Map<number | string, EventTarget[]> = new Map();
    /**这是事件目标数组锁，应用于在处理emit的内部循环操作时，如果执行的目标函数内出现移除操作，不能直接移除，而是给它打上失效标记 */
    private eventTargetsLock: EventTarget[] = null;
    /**在加锁后，出现多少次移除操作 */
    private removeCountOnLock: number = 0;

    public on(event: number | string, context: any, method: Function, once: boolean = false) {
        let eventTargets = this.eventMap.get(event);
        if (eventTargets) {
            let eventTarget: EventTarget = {context: context, method: method, isValid: true, once: once};
            eventTargets.push(eventTarget);
        } else {
            let eventTarget: EventTarget = {context: context, method: method, isValid: true, once: once};
            this.eventMap.set(event, [eventTarget]); 
        }
    }

    public once(event: number | string, context: any, method: Function) {
        this.on(event, context, method, true);
    }

    public off(event: number | string, context?: any, method?: Function) {
        let eventTargets = this.eventMap.get(event);
        if (eventTargets) {
            if (event && !context && !method) {
                if (eventTargets.length > 0) {
                    if (eventTargets == this.eventTargetsLock) {
                        for (let eventTarget of eventTargets) {
                            eventTarget.isValid = false;
                            this.removeCountOnLock++;
                        }
                    } else {
                        eventTargets.splice(0, eventTargets.length);
                    }
                }
            }
            if (event && context && !method) {
                for (let i = eventTargets.length - 1; i >= 0; i--) {
                    let eventTarget = eventTargets[i];
                    if (eventTarget.context == context) {
                        eventTargets == this.eventTargetsLock ? (eventTarget.isValid = false, this.removeCountOnLock++) : eventTargets.splice(i, 1);
                    }
                } 
            }
            if (event && context && method) {
                for (let i = eventTargets.length - 1; i >= 0; i--) {
                    let eventTarget = eventTargets[i];
                    if (eventTarget.context == context && eventTarget.method == method) {
                        eventTargets == this.eventTargetsLock ? (eventTarget.isValid = false, this.removeCountOnLock++) : eventTargets.splice(i, 1);
                    }
                } 
            }
        }
    }

    public emit(event: number | string, args?: any[]) {
        let eventTargets = this.eventMap.get(event);
        if (eventTargets) {
            //上锁，后面循环处理的函数中如果出现移除注册事件操作，不能直接移除，应该打上失效标记
            this.eventTargetsLock = eventTargets;
            //循环处理目标函数
            for (let eventTarget of eventTargets) {
                try {
                    eventTarget.method.apply(eventTarget.context, args);
                } catch (e) {}
                if (eventTarget.once) {
                    eventTarget.isValid = false;
                    this.removeCountOnLock++;
                }
            }
            //解锁
            this.eventTargetsLock = null;
            //移除失效的注册事件
            if (this.removeCountOnLock > 0) {
                for (let i = eventTargets.length - 1; i >= 0; i--) {
                    if (!eventTargets[i].isValid) {
                        eventTargets.splice(i, 1);
                    }
                }
                this.removeCountOnLock = 0;
            }
        }
    }
}
interface EventTarget {
    context: any;
    method: Function;
    isValid: boolean;
    once: boolean;
}