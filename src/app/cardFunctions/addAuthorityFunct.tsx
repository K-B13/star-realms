import { addAuthority, PlayerType } from "../classes/player"

export const addAuthorityFunct = (player: PlayerType, amount: number) => {
    addAuthority(player, amount)
}