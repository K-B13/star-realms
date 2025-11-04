export type Faction = 'Trade Federation' | 'Blob Faction' | 'Machine Cult' | 'Star Empire' | 'Neutral'
export type Trigger = 'onPlay' | 'onScrap' | 'onAlly'
export type Effect = 
| { kind: 'addTrade', amount: number }
| { kind: 'addCombat', amount: number }
| { kind: 'addAuthority', amount: number }
| { kind: 'drawCards', amount: number }
| { kind: 'scrapSelf'}
| { kind: 'prompt', prompt: { kind: string, optional?: boolean, data?: unknown }}

export interface Ability {
    trigger: Trigger;
    effects: Effect[];
}

export interface CardDef {
    id: string;
    name: string;
    cost: number;
    faction: Faction;
    type: 'ship' | 'base'
    abilities: Ability[];

}

export const cardRegistry: Record<string, CardDef> = {
    SCOUT: {
        id: 'SCOUT',
        name: 'Scout',
        cost: 0,
        faction: 'Neutral',
        type: 'ship',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 1 }
                ]
            }
        ]
    },
    VIPER: {
        id: 'VIPER',
        name: 'Viper',
        cost: 0,
        faction: 'Neutral',
        type: 'ship',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 1 }
                ]
            }
        ]
    },
    EXPLORER: {
        id: 'EXPLORER',
        name: 'Explorer',
        cost: 2,
        faction: 'Neutral',
        type: 'ship',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 }
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addCombat', amount: 2 },
                    { kind: 'scrapSelf' }
                ]
            }
        ]
    }
}