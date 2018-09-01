import { SaveGame, SaveGamePlayer } from "../models/save-game";
import { Party } from "../models/party";
import { Assets } from "../models/assets";
import { LocationService } from "./location.service";

const LOCAL_STORAGE_KEY = 'dice-and-roll';

export class SaveGameService {
    
    static isGameSaved() {
        return localStorage.getItem('dice-and-roll') != null;
    }

    // loads data from the local storage and transforms it into Party structure
    static load(): Party {
        let save: SaveGame = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));        
        
        let party = new Party();

        save.members.forEach(member => {
            let character = {...Assets.characters[member.name]};
            
            character.armor = member.armor;
            character.weapon = member.weapon;
            character.specialsUsed = member.specialsUsed;

            party.add(character);
        });

        party.totalMana = save.totalMana;

        save.visitedLocations.forEach(visited => {
            let location = LocationService.get(visited);
            party.locationVisited(location);
        });

        return party;
    }

    // flattens the Party structure into serializable SaveGame structure suitable for local storage
    static save(data: Party) {

        let save = new SaveGame();

        data.members.forEach(member => {
            save.members.push({
                name: member.name,
                armor: member.armor.name,
                weapon: member.weapon.name,
                specialsUsed: member.specialsUsed
            });
        });

        save.totalMana = data.totalMana;

        save.visitedLocations = data.getAllVisitedLocations();

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(save));
    }
}