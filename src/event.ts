export interface EventLisnter {
    fn: Function,
    context?: any,
    once?: boolean
}

export interface EventContainer {
    single?: EventLisnter
    multiple?: EventLisnter[]
}

function fastRemove(arr: any[], index: number) {
    arr[index] = arr[arr.length - 1];
    arr.length--;
}

export class Event {
    protected _containerMap: Record<string, EventContainer | undefined> = {}
    on(event: string, fn: Function, context?: any, once?: boolean) {
        if (!this._containerMap[event]) {
            this._containerMap[event] = {
                single: {
                    fn, context, once
                }
            }
        } else {
            const container = this._containerMap[event]!;
            container.multiple = [container.single!, { fn, context, once }];
            container.single = undefined;
        }
    }

    once(event: string, fn: Function, context?: any) {
        this.on(event, fn, context, true);
    }

    off(event: string, fn: Function, context?: any) {
        const container = this._containerMap[event];
        if (!container) return false;
        if (container.single) {
            const fc = container.single;
            if (fc.fn === fn && fc.context === context) {
                return this._containerMap[event] = undefined, true;
            }
        } else {
            const fcList = container.multiple!;
            for (let i = 0, len = fcList.length; i < len; i++) {
                const fc = fcList[0];
                if (fc.fn === fn && fc.context === context) {
                    fastRemove(fcList, i);
                    if (fcList.length === 1) {
                        container.single = fcList[0];
                        container.multiple = undefined;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    emit(event: string, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any) {
        const container = this._containerMap[event];
        if (!container) return 0;
        const parmLen = arguments.length;
        let args: any[] | null = null;
        if (container.single) {
            const fc = container.single;
            if (fc.once) {
                this._containerMap[event] = undefined;
            }
            switch (parmLen) {
                case 1:
                    return fc.fn.call(fc.context), 1
                case 2:
                    return fc.fn.call(fc.context, a1), 1
                case 3:
                    return fc.fn.call(fc.context, a1, a2), 1
                case 4:
                    return fc.fn.call(fc.context, a1, a2, a3), 1
                case 5:
                    return fc.fn.call(fc.context, a1, a2, a3, a4), 1
                case 6:
                    return fc.fn.call(fc.context, a1, a2, a3, a4, a5), 1
                case 7:
                    return fc.fn.call(fc.context, a1, a2, a3, a4, a5, a6), 1
                default:
                    if (!args) {
                        args = new Array(parmLen - 1)
                        for (let j = 1; j < parmLen; j++) {
                            args[j - 1] = arguments[j];
                        }
                    }
                    return fc.fn.apply(fc.context, args), 1;
            }
        } else {
            const fcList = container.multiple!;
            for (let i = 0, fcLen = fcList.length; i < fcLen; i++) {
                const fc = fcList[i];
                switch (parmLen) {
                    case 1:
                        fc.fn.call(fc.context); break;
                    case 2:
                        fc.fn.call(fc.context, a1); break;
                    case 3:
                        fc.fn.call(fc.context, a1, a2); break;
                    case 4:
                        fc.fn.call(fc.context, a1, a2, a3); break;
                    case 5:
                        fc.fn.call(fc.context, a1, a2, a3, a4); break;
                    case 6:
                        fc.fn.call(fc.context, a1, a2, a3, a4, a5); break;
                    case 7:
                        fc.fn.call(fc.context, a1, a2, a3, a4, a5, a6); break;
                    default:
                        if (!args) {
                            args = new Array(parmLen - 1)
                            for (let j = 1; j < parmLen; j++) {
                                args[j - 1] = arguments[j];
                            }
                        }
                        fc.fn.apply(fc.context, args);
                }
            }
            return fcList.length;
        }
    }

    offAll(event: string) {
        const container = this._containerMap[event];
        if (!container) return 0;
        if (container.single) return 1;
        return container.multiple!.length;
    }
}