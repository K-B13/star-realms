import { CardType } from "./card";

export interface BaseType extends CardType {
    type: 'base',
    shield: number,
    outpost: boolean
}