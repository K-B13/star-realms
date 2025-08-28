import { PlayerType } from "../classes/player";
import { addCombatPower } from "../classes/player";

const addCombatFunct = (player: PlayerType, amount: number) => {
    addCombatPower(player, amount)
}

export default addCombatFunct
