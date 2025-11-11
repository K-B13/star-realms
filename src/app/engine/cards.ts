export type Faction = 'Trade Federation' | 'Blob Faction' | 'Machine Cult' | 'Star Empire' | 'Neutral'
export type Trigger = 'onPlay' | 'onScrap' | 'onAlly'
export type Effect = 
| { kind: 'addTrade', amount: number }
| { kind: 'addCombat', amount: number }
| { kind: 'addAuthority', amount: number }
| { kind: 'drawCards', amount: number }
| { kind: 'scrapSelf' }
| { kind: 'nextAcquireTop' }
| { kind: 'nextAcquireFree' }
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
    selfScrap: boolean;
    abilities: Ability[];
}

export const cardRegistry: Record<string, CardDef> = {
    SCOUT: {
        id: 'SCOUT',
        name: 'Scout',
        cost: 0,
        faction: 'Neutral',
        type: 'ship',
        selfScrap: false,
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
        selfScrap: false,
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
        selfScrap: true,
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
        selfScrap: false,
        description: "Fast? This baby doesn't just haul cargo. She hauls...",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addAuthority', amount: 4 }
                ]
            }
        ]
    },
    CUTTER: {
        id: 'CUTTER',
        name: 'Cutter',
        cost: 2,
        faction: 'Trade Federation',
        type: 'ship',
        selfScrap: false,
        description: "Built for cargo, armed for conflict. Versatility for an unpredictable universe.",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 },
                    { kind: 'addAuthority', amount: 4 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 4 }
                ]
            }
        ]
    },
    EMBASSYYACHT: {
        id: 'EMBASSYYACHT',
        name: 'Embassy Yacht',
        cost: 3,
        faction: 'Trade Federation',
        type: 'ship',
        selfScrap: false,
        description: "War should always be a last resort. It's bad for the bottom line",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 },
                    { kind: 'addAuthority', amount: 3 }
                ]
            }
        ]
    },  
    FREIGHTER: {
        id: 'FREIGHTER',
        name: 'Freighter',
        cost: 4,
        faction: 'Trade Federation',
        type: 'ship',
        selfScrap: false,
        description: "This class of mammoth cargo ships is one of the keys to the federations vast trade-based wealth",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 4 },
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'nextAcquireTop' }
                ]
            }
        ]
    },
    COMMANDSHIP: {
        id: 'COMMANDSHIP',
        name: 'Command Ship',
        cost: 8,
        faction: 'Trade Federation',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addAuthority', amount: 4 },
                    { kind: 'addCombat', amount: 5 },
                    { kind: 'drawCards', amount: 2 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'nextAcquireTop' }
                ]
            }
        ]
    },
    TRADEESCORT: {
        id: 'TRADEESCORT',
        name: 'Trade Escort',
        cost: 5,
        faction: 'Trade Federation',
        type: 'ship',
        selfScrap: false,
        description: "This heavily-armoured Escort class was the Federation's first response to the Blob threat",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addAuthority', amount: 4 },
                    { kind: 'addCombat', amount: 4 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    FLAGSHIP: {
        id: 'FLAGSHIP',
        name: 'Flag Ship',
        cost: 6,
        faction: 'Trade Federation',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 5 },
                    { kind: 'drawCards', amount: 1 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addAuthority', amount: 5 }
                ]
            }
        ]
    },
    BLOBFIGHTER: {
        id: 'BLOBFIGHTER',
        name: 'Blob Fighter',
        cost: 1,
        faction: 'Blob Faction',
        type: 'ship',
        selfScrap: false,
        description: "Either kill it before it signals the hive or run. There are other choices but non you'll live through",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 3 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    TRADEPOD: {
        id: 'TRADEPOD',
        name: 'Trade Pod',
        cost: 2,
        faction: 'Blob Faction',
        type: 'ship',
        selfScrap: false,
        description: "The loading and offloading process is efficient but disgusting",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 3 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            }
        ]
    },
    BATTLEPOD: {
        id: 'BATTLEPOD',
        name: 'Battle Pod',
        cost: 2,
        faction: 'Blob Faction',
        type: 'ship',
        selfScrap: false,
        description: "The loading and offloading process is efficient but disgusting",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 4 },
                    { kind: 'prompt', prompt: { kind: 'scrapRow', optional: true } }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            }
        ]
    },
    RAM: {
        id: 'RAM',
        name: 'Ram',
        cost: 3,
        faction: 'Blob Faction',
        type: 'ship',
        selfScrap: true,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 5 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
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
    BLOBDESTROYER: {
        id: 'BLOBDESTROYER',
        name: 'Blob Destroyer',
        cost: 4,
        faction: 'Blob Faction',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 6 }
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
        selfScrap: true,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 8 },
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'drawCards', amount: 1 }
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
    BLOBCARRIER: {
        id: 'BLOBCARRIER',
        name: 'Blob Carrier',
        cost: 6,
        faction: 'Blob Faction',
        type: 'ship',
        selfScrap: false,
        description: "Is that... a whale?",
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 7 },
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'nextAcquireFree' },
                    { kind: 'nextAcquireTop' },
                    { kind: 'prompt', prompt: { kind: 'chooseRowForFree', optional: false, data: { purpose: '' } } }
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
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 6 },
                    { kind: 'drawCards', amount: 1 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    IMPERIALFIGHTER: {
        id: 'IMPERIALFIGHTER',
        name: 'Imperial Fighter',
        cost: 1,
        faction: 'Star Empire',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 2 },
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: false, data: { purpose: 'opponentDiscard' } } }
                ]
            }, {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            }
        ]
    },
    IMPERIALFRIGATE: {
        id: 'IMPERIALFRIGATE',
        name: 'Imperial Frigate',
        cost: 3,
        faction: 'Star Empire',
        type: 'ship',
        selfScrap: true,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 4 },
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: false, data: { purpose: 'opponentDiscard' } } }
                ]
            }, {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    SURVEYSHIP: {
        id: 'SURVEYSHIP',
        name: 'Survey Ship',
        cost: 3,
        faction: 'Star Empire',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 1 },
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    CORVETTE: {
        id: 'CORVETTE',
        name: 'Corvette',
        cost: 2,
        faction: 'Star Empire',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 1 },
                    { kind: 'drawCards', amount: 1 }
                ]
            }, {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            }
        ]
    },
    BATTLECRUISER: {
        id: 'BATTLECRUISER',
        name: 'Battle Cruiser',
        cost: 6,
        faction: 'Star Empire',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 5 },
                    { kind: 'drawCards', amount: 1 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: false, data: { purpose: 'opponentDiscard' } } }
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    DREADNAUGHT: {
        id: 'DREADNAUGHT',
        name: 'Dreadnought',
        cost: 7,
        faction: 'Star Empire',
        type: 'ship',
        selfScrap: true,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 7 },
                    { kind: 'drawCards', amount: 1 }
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addCombat', amount: 5 }
                ]
            }
        ]
    },
    TRADEBOT: {
        id: 'TRADEBOT',
        name: 'Trade Bot',
        cost: 1,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 1 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            }
        ]
    },
    MISSILEBOT: {
        id: 'MISSILEBOT',
        name: 'Missile Bot',
        cost: 2,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            }
        ]
    },
    SUPPLYBOT: {
        id: 'SUPPLYBOT',
        name: 'Supply Bot',
        cost: 3,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'addCombat', amount: 2 }
                ]
            }
        ]
    },
    BATTLEMECH: {
        id: 'BATTLEMECH',
        name: 'Battle Mech',
        cost: 5,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 4 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    MISSILEMECH: {
        id: 'MISSILEMECH',
        name: 'Missile Mech',
        cost: 6,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 6 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    }
}