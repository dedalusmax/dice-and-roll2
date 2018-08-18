import { Special, TargetType, ExecutionType, EffectType, LingeringType } from "../models/special";
import { Assets } from "../models/assets";

export class SpecialService {

    static get(name: string): Special {
        var key = Object.keys(Assets.specials).find(w => w == name);
        return this.matchSpecial(Assets.specials[key]);
    }

    static matchSpecial(prop: any): Special {
        var result = new Special();
        result.name = prop.name;
        result.title = prop.title;
        result.description = prop.description;
        result.targetType = TargetType[prop.targetType as string];
        result.executionType = ExecutionType[prop.executionType as string];
        result.effectType = EffectType[prop.effectType as string];
        result.lingeringType = prop.lingeringType ? LingeringType[prop.lingeringType as string] : null;
        result.duration = prop.duration;
        result.modifier = prop.modifier;
        result.manaCost = prop.manaCost;
        return result;
    }
}