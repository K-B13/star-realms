import { PlayerType } from "./player";

export interface CardType extends BaseCardType {
    id: string,
    mainFunctionality: CardFunctionality,
    allyFunctionality?: CardFunctionality,
    scrapFunctionality?: CardFunctionality,
}

export interface BaseCardType {
    name: string,
    faction: "Trade Federation" | "Machine Cult" | "The Blob" | "Star Empire" | "Neutral",
    cost: number,
    trade?: number,
    combat?: number,
    authority?: number,
    draw?: number,
    mainDescription: string,
    allyDescription?: string,
    scrapDescription?: string,
    extraText?: string,
    secondaryDescription?: string
}

export type CardFunctionality = {
    requirement: string[];
    execute: ({
        player, 
        context
    }: {
        player: PlayerType, 
        context?: Record<string, unknown>
    }) => void;
};