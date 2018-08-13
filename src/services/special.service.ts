import { Special, TargetType, ExecutionType, StatusType } from "../models/special";
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
        result.description = prop.desc;
        result.targetType = TargetType[prop.targetType as string];
        result.executionType = ExecutionType[prop.executionType as string];
        result.attackCount = prop.attackCount;
        result.modifier = prop.modifier;
        result.statusType = prop.statusType ? StatusType[prop.statusType as string] : null;
        result.duration = prop.duration;
        result.power = prop.power;
        return result;
    }
}