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
    description?: string;
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
    },
    FEDERATIONSHUTTLE: {
        id: 'FEDERATIONSHUTTLE',
        name: 'Federation Shuttle',
        cost: 1,
        faction: 'Trade Federation',
        type: 'ship',
        description: "Fast? This baby doesn't just haul cargo. She hauls...",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 }
                ]
            },
        ]
    },
    CUTTER: {
        id: 'CUTTER',
        name: 'Cutter',
        cost: 2,
        faction: 'Trade Federation',
        type: 'ship',
        description: "Built for cargo, armed for conflict. Versatility for an unpredictable universe.",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 },
                    { kind: 'addAuthority', amount: 4 }
                ]
            },
        ]
    },
    FREIGHTER: {
        id: 'FREIGHTER',
        name: 'Freighter',
        cost: 4,
        faction: 'Trade Federation',
        type: 'ship',
        description: "This class of mammoth cargo ships is one of the keys to the federations vast trade-based wealth",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 4 },
                ]
            },
        ]
    },
    FLAGSHIP: {
        id: 'FLAGSHIP',
        name: 'Flag Ship',
        cost: 6,
        faction: 'Trade Federation',
        type: 'ship',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 5 },
                    { kind: 'drawCards', amount: 1 }
                ]
            },
        ]
    },
    TRADEESCORT: {
        id: 'TRADEESCORT',
        name: 'Trade Escort',
        cost: 5,
        faction: 'Trade Federation',
        type: 'ship',
        description: "This heavily-armoured Escort class was the Federation's first response to the Blob threat",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addAuthority', amount: 4 },
                    { kind: 'addCombat', amount: 4 }
                ]
            },
        ]
    },
    BLOBFIGHTER: {
        id: 'BLOBFIGHTER',
        name: 'Blob Fighter',
        cost: 1,
        faction: 'Blob Faction',
        type: 'ship',
        description: "Either kill it before it signals the hive or run. There are other choices but non you'll live through",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 3 }
                ]
            },
        ]
    },
    TRADEPOD: {
        id: 'TRADEPOD',
        name: 'Trade Pod',
        cost: 2,
        faction: 'Blob Faction',
        type: 'ship',
        description: "The loading and offloading process is efficient but disgusting",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 3 }
                ]
            },
        ]
    },
    RAM: {
        id: 'RAM',
        name: 'Ram',
        cost: 3,
        faction: 'Blob Faction',
        type: 'ship',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 5 }
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addTrade', amount: 3 }
                ]
            }
        ]
    },
    BATTLEBLOB: {
        id: 'BATTLEBLOB',
        name: 'Battle Blob',
        cost: 6,
        faction: 'Blob Faction',
        type: 'ship',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 8 },
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addCombat', amount: 4 }
                ]
            }
        ]
    },
    MOTHERSHIP: {
        id: 'MOTHERSHIP',
        name: 'Mothership',
        cost: 7,
        faction: 'Blob Faction',
        type: 'ship',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 6 },
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    // SURVEYSHIP: {
    //     id: 'SURVEYSHIP',
    //     name: 'Survey Ship',
    //     cost: 3,
    //     faction: 'Star Empire',
    //     type: 'ship',
    //     abilities: [
    //         {
    //             trigger: 'onPlay',
    //             effects: [
    //                 { kind: 'addTrade', amount: 1 },
    //                 { kind: 'drawCards', amount: 1 }
    //             ]
    //         }
    //     ]
    // },
    // CORVETTE: {
    //     id: 'CORVETTE',
    //     name: 'Corvette',
    //     cost: 2,
    //     faction: 'Star Empire',
    //     type: 'ship',
    //     abilities: [
    //         {
    //             trigger: 'onPlay',
    //             effects: [
    //                 { kind: 'addCombat', amount: 1 },
    //                 { kind: 'drawCards', amount: 1 }
    //             ]
    //         }
    //     ]
    // },
    // BATTLECRUISER: {
    //     id: 'BATTLECRUISER',
    //     name: 'Battle Cruiser',
    //     cost: 6,
    //     faction: 'Star Empire',
    //     type: 'ship',
    //     abilities: [
    //         {
    //             trigger: 'onPlay',
    //             effects: [
    //                 { kind: 'addCombat', amount: 5 },
    //                 { kind: 'drawCards', amount: 1 }
    //             ]
    //         }

    //     ]
    // },
    // DREADNAUGHT: {
    //     id: 'DREADNAUGHT',
    //     name: 'Dreadnought',
    //     cost: 7,
    //     faction: 'Star Empire',
    //     type: 'ship',
    //     abilities: [
    //         {
    //             trigger: 'onPlay',
    //             effects: [
    //                 { kind: 'addCombat', amount: 7 },
    //                 { kind: 'drawCards', amount: 1 }
    //             ]
    //         },
    //         {
    //             trigger: 'onScrap',
    //             effects: [
    //                 { kind: 'addCombat', amount: 5 }
    //             ]
    //         }

    //     ]
    // }
}