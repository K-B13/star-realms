import { PlayerType } from "../classes/player";
import { BaseType } from "../classes/base";
import { removeBase } from "../classes/player";

const destroyTargetBaseFunct = (targetPlayer: PlayerType, card: BaseType) => {
    removeBase(targetPlayer, card)
}

export default destroyTargetBaseFunct