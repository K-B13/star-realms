import { PlayerType } from "../classes/player";
import { addTrade } from "../classes/player";

const addTradeFunct = (player: PlayerType, value: number) => {
    addTrade(player, value)
}

export default addTradeFunct
