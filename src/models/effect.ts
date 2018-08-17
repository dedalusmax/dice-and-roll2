import { Special } from "./special";

export class Effect extends Special {
    
    startingRound: boolean;

    constructor(special: Special) {
        super();
        Object.assign(this, special);
;    }
}