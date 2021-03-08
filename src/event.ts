export interface EventLisnter {
    fn: Function;
    context?: any;
    once?: boolean;
}

export interface EventContainer {
    single?: EventLisnter;
    multiple?: EventLisnter[];
    running: boolean;
}

function fastRemove(arr: any[], index: number) {
    arr[index] = arr[arr.length - 1];
    arr.length--;
}

export class Event {
    protected _containerMap: Record<string, EventContainer | undefined> = {};
    protected _cache: { args: IArguments; type: 'on' | 'off' }[] = [];
    on(event: string, fn: Function, context?: any, once?: boolean) {
        if (!this._containerMap[event]) {
            this._containerMap[event] = {
                single: {
                    fn,
                    context,
                    once,
                },
                running: false,
            };
        } else {
            const container = this._containerMap[event]!;
            if (container.running) {
                this._cache.push({ args: arguments, type: 'on' });
            } else {
                if (container.single) {
                    container.multiple = [
                        container.single!,
                        { fn, context, once },
                    ];
                    container.single = undefined;
                } else {
                    container.multiple!.push({ fn, context, once });
                }
            }
        }
    }

    once(event: string, fn: Function, context?: any) {
        this.on(event, fn, context, true);
    }

    off(event: string, fn: Function, context?: any) {
        const container = this._containerMap[event];
        if (!container) return false;
        if (container.running) {
            this._cache.push({ args: arguments, type: 'off' });
            return true;
        } else {
            if (container.single) {
                const fc = container.single;
                if (fc.fn === fn && fc.context === context) {
                    return (this._containerMap[event] = undefined), true;
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
        }
        return false;
    }

    emit(
        event: string,
        a1?: any,
        a2?: any,
        a3?: any,
        a4?: any,
        a5?: any,
        a6?: any
    ) {
        const container = this._containerMap[event];
        if (!container) return 0;
        container.running = true;
        const parmLen = arguments.length;
        let args: any[] | null = null;
        let effectCount = 0;
        if (container.single) {
            const fc = container.single;
            if (fc.once) {
                this._containerMap[event] = undefined;
            }
            switch (parmLen) {
                case 1:
                    fc.fn.call(fc.context);
                    break;
                case 2:
                    fc.fn.call(fc.context, a1);
                    break;
                case 3:
                    fc.fn.call(fc.context, a1, a2);
                    break;
                case 4:
                    fc.fn.call(fc.context, a1, a2, a3);
                    break;
                case 5:
                    fc.fn.call(fc.context, a1, a2, a3, a4);
                    break;
                case 6:
                    fc.fn.call(fc.context, a1, a2, a3, a4, a5);
                    break;
                case 7:
                    fc.fn.call(fc.context, a1, a2, a3, a4, a5, a6);
                    break;
                default:
                    if (!args) {
                        args = new Array(parmLen - 1);
                        for (let j = 1; j < parmLen; j++) {
                            args[j - 1] = arguments[j];
                        }
                    }
                    fc.fn.apply(fc.context, args);
            }
            effectCount = 1;
        } else {
            const fcList = container.multiple!;
            for (let i = 0, fcLen = fcList.length; i < fcLen; i++) {
                const fc = fcList[i];
                switch (parmLen) {
                    case 1:
                        fc.fn.call(fc.context);
                        break;
                    case 2:
                        fc.fn.call(fc.context, a1);
                        break;
                    case 3:
                        fc.fn.call(fc.context, a1, a2);
                        break;
                    case 4:
                        fc.fn.call(fc.context, a1, a2, a3);
                        break;
                    case 5:
                        fc.fn.call(fc.context, a1, a2, a3, a4);
                        break;
                    case 6:
                        fc.fn.call(fc.context, a1, a2, a3, a4, a5);
                        break;
                    case 7:
                        fc.fn.call(fc.context, a1, a2, a3, a4, a5, a6);
                        break;
                    default:
                        if (!args) {
                            args = new Array(parmLen - 1);
                            for (let j = 1; j < parmLen; j++) {
                                args[j - 1] = arguments[j];
                            }
                        }
                        fc.fn.apply(fc.context, args);
                }
            }
            effectCount = fcList.length;
        }
        container.running = false;
        if (this._cache.length > 0) {
            for (let c of this._cache) {
                c.type === 'on'
                    ? this.on.call(
                          this,
                          c.args[0],
                          c.args[1],
                          c.args[2],
                          c.args[3]
                      )
                    : this.off.call(this, c.args[0], c.args[1], c.args[2]);
            }
        }
        return effectCount;
    }

    offAll(event: string) {
        const container = this._containerMap[event];
        if (!container) return 0;
        if (container.single) return 1;
        return container.multiple!.length;
    }
}
