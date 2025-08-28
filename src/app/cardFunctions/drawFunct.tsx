import { drawCard, PlayerType } from "../classes/player"

export const drawFunct = (player: PlayerType, amount: number) => {
    for (let i = 1; i <= amount; i++) {
        drawCard(player)
    }
}