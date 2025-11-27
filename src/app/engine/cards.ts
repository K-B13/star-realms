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
| { kind: 'multiBaseCondition', amount: number }
| { kind: 'scrapAndDraw', maxCards: number }
| { kind: 'prompt', prompt: { kind: string, optional?: boolean, data?: unknown }}

export interface Ability {
    trigger: Trigger;
    effects: Effect[];
}

interface CardText {
    play: string[];
    ally?: string[];
    scrap?: string[];
}

export interface CardDef {
    id: string;
    name: string;
    cost: number;
    faction: Faction;
    description?: string;
    selfScrap: boolean;
    text: CardText;
    abilities: Ability[];
    type: 'ship' | 'base';
}

export interface BaseDef extends CardDef {
    shield: 'outpost' | 'normal';
    defence: number;
    type: 'base';
}

export interface ShipDef extends CardDef {
    type: 'ship';
}

export const cardRegistry: Record<string, ShipDef | BaseDef> = {
    SCOUT: {
        id: 'SCOUT',
        name: 'Scout',
        cost: 0,
        faction: 'Neutral',
        type: 'ship',
        selfScrap: false,
        text: {
            play: [`+1 Trade`]
        },
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
        text: {
            play: [`+1 Combat`]
        },
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
        text: {
            play: [`+2 Trade`],
            scrap: [`+2 Combat`]
        },
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
        text: {
            play: [`+2 Trade`],
            ally: [`+4 Authority`]
        },
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
        text: {
            play: [`+2 Trade`, `+4 Authority`],
            ally: [`+4 Combat`]
        },
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
        text: {
            play: [`+2 Trade`, `+3 Authority`],
            ally: ['If you have 2 or more bases in play, draw 2 cards']
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 },
                    { kind: 'addAuthority', amount: 3 }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'multiBaseCondition', amount: 2 }
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
        text: {
            play: [`+4 Trade`],
            ally: [`Next card acquired from trade row goes to top of the deck`]
        },
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
        text: {
            play: [`+4 Authority`, `+5 Combat`, `Draw 2 cards`],
            ally: [`May destroy a target base`]
        },
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
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: true, data: { purpose: 'destroyOpponentBase' } } }
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
        text: {
            play: [`+4 Authority`, `+4 Combat`],
            ally: [`Draw 1 card`]
        },
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
        text: {
            play: [`+5 Combat`, `Draw 1 card`],
            ally: [`Add 5 authority`]
        },
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
    TRADINGPOST: {
        id: 'TRADINGPOST',
        name: 'Trading Post',
        cost: 3,
        faction: 'Trade Federation',
        type: 'base',
        selfScrap: true,
        text: {
            play: [`+1 Trade or +1 Authority per turn`],
            scrap: [`+3 Combat`]
        },
        defence: 4,
        shield: 'outpost',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseAbility', optional: false, data: { options:
                        [
                            { t: 'AuthorityAdded', amount: 1, label: '+1 Authority' },
                            { t: 'TradeAdded', amount: 1, label: '+1 Trade' }
                        ],
                        card: 'TRADINGPOST'
                    }} }
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addCombat', amount: 3 }
                ]
            }
        ]
    },
    BARTERWORLD: {
        id: 'BARTERWORLD',
        name: 'Barter World',
        cost: 4,
        faction: 'Trade Federation',
        type: 'base',
        selfScrap: true,
        text: {
            play: [`+2 Trade or +2 Authority per turn`],
            scrap: [`+5 Combat`]
        },
        defence: 4,
        shield: 'normal',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseAbility', optional: false, data: { options:
                        [
                            { t: 'AuthorityAdded', amount: 2, label: '+2 Authority' },
                            { t: 'TradeAdded', amount: 2, label: '+2 Trade' }
                        ],
                        card: 'BARTERWORLD'
                    }} }
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
    DEFENCECENTRE: {
        id: 'DEFENCECENTRE',
        name: 'Defence Centre',
        cost: 5,
        faction: 'Trade Federation',
        type: 'base',
        selfScrap: false,
        text: {
            play: [`+2 Combat or +3 Authority per turn`],
            ally: [`+2 Combat`]
        },
        defence: 5,
        shield: 'outpost',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseAbility', optional: false, data: { options:
                        [
                            { t: 'AuthorityAdded', amount: 3, label: '+3 Authority' },
                            { t: 'CombatAdded', amount: 2, label: '+2 Combat' }
                        ],
                        card: 'DEFENCECENTRE'
                    }} }
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
    CENTRALOFFICE: {
        id: 'CENTRALOFFICE',
        name: 'Central Office',
        cost: 7,
        faction: 'Trade Federation',
        type: 'base',
        selfScrap: false,
        text: {
            play: [`+2 Trade and \nNext card acquired from trade row goes to top of the deck`],
            ally: [`Draw 1 card`]
        },
        defence: 6,
        shield: 'normal',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 },
                    { kind: 'nextAcquireTop' },
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
    PORTOFCALL: {
        id: 'PORTOFCALL',
        name: 'Port of Call',
        cost: 6,
        faction: 'Trade Federation',
        type: 'base',
        selfScrap: true,
        text: {
            play: [`+3 Trade`],
            scrap: [`Draw 1 card`, `May destroy a target base`]
        },
        defence: 6,
        shield: 'outpost',
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 3 },
                ]
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'drawCards', amount: 1 },
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: true, data: { purpose: 'destroyOpponentBase' } } }
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
        text: {
            play: [`+3 Combat`],
            ally: [`Draw 1 card`]
        },
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
        text: {
            play: [`+3 Trade`],
            ally: [`+2 Combat`]
        },
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
        text: {
            play: [`+4 Combat`, `You may scrap a card in the trade row`],
            ally: [`+2 Combat`]
        },
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
        text: {
            play: [`+5 Combat`],
            ally: [`+2 Combat`],
            scrap: [`+3 Trade`]
        },
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
        description: "When this monstrous ship shows up on a colony's sensors they know the end is near.",
        text: {
            play: [`+6 Combat`],
            ally: ['You may destroy target base', 'and/or scrap a card in the trade row']
        },
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
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: true, data: { purpose: 'destroyOpponentBase' } } },
                    { kind: 'prompt', prompt: { kind: 'scrapRow', optional: true } }
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
        text: {
            play: [`+8 Combat`],
            ally: [`Draw 1 card`],
            scrap: [`+4 Combat`]
        },
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
        text: {
            play: [`+7 Combat`],
            ally: [`Next card acquired from trade row is free and goes to top of the deck`]
        },
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
        text: {
            play: [`+6 Combat`, `Draw 1 card`],
            ally: [`Draw 1 card`]
        },
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
    BLOBWHEEL: {
        id: 'BLOBWHEEL',
        name: 'Blob Wheel',
        cost: 3,
        faction: 'Blob Faction',
        type: 'base',
        selfScrap: true,
        shield: 'normal',
        defence: 5,
        text: {
            play: [`+1 Combat`],
            scrap: [`+3 Trade`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 1 },
                ]
            }, {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addTrade', amount: 3 }
                ]
            }
        ]
    },
    THEHIVE: {
        id: 'THEHIVE',
        name: 'The Hive',
        cost: 5,
        faction: 'Blob Faction',
        type: 'base',
        selfScrap: false,
        shield: 'normal',
        defence: 5,
        text: {
            play: [`+3 Combat`],
            ally: [`Draw 1 card`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 3 },
                ]
            }, {
                trigger: 'onAlly',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    BLOBWORLD: {
        id: 'BLOBWORLD',
        name: 'Blob World',
        cost: 8,
        faction: 'Blob Faction',
        type: 'base',
        selfScrap: false,
        shield: 'normal',
        defence: 7,
        text: {
            play: [`+5 Combat`, `or draw a card for each Blob Faction card played this turn`],
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseAbility', optional: false, data: { options:
                        [
                            { t: 'DrawPerFactionCard', card: 'BLOBWORLD' },
                            { t: 'CombatAdded', amount: 5, label: '+5 Combat' }
                        ],
                        card: 'BLOBWORLD'
                    }} }
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
        text: {
            play: [`+2 Combat`, `Choose a player to discard a card`],
            ally: [`+2 Combat`]
        },
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
        text: {
            play: [`+4 Combat`, `Choose a player to discard a card`],
            ally: [`+2 Combat`],
            scrap: [`Draw 1 card`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: false, data: { purpose: 'opponentDiscard' } } },
                    { kind: 'addCombat', amount: 4 }
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
        text: {
            play: [`+1 Trade`, `Draw 1 card`]
        },
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
        text: {
            play: [`+1 Combat`, `Draw 1 card`],
            ally: [`+2 Combat`]
        },
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
        text: {
            play: [`+5 Combat`, `Draw 1 card`],
            ally: [`Choose a player to discard a card`],
            scrap: [`Draw 1 card`, `And you may destroy a target base`]
        },
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
                    { kind: 'drawCards', amount: 1 },
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: true, data: { purpose: 'destroyOpponentBase' } } }
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
        text: {
            play: [`+7 Combat`, `Draw 1 card`],
            scrap: [`+5 Combat`]
        },
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
    SPACESTATION: {
        id: 'SPACESTATION',
        name: 'Space Station',
        cost: 4,
        faction: 'Star Empire',
        type: 'base',
        selfScrap: false,
        shield: 'outpost',
        defence: 4,
        text: {
            play: [`+2 Combat`],
            ally: [`+2 Combat`],
            scrap: [`+4 Trade`]
        },
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
            },
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addTrade', amount: 4 }
                ]
            }
        ]
    },
    RECYCLINGSTATION: {
        id: 'RECYCLINGSTATION',
        name: 'Recycling Station',
        cost: 4,
        faction: 'Star Empire',
        type: 'base',
        selfScrap: false,
        shield: 'outpost',
        defence: 4,
        text: {
            play: [`+1 Trade`, 'or discard up to 2, then draw that many'],
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseAbility', 
                        optional: true, data: { options: [
                            { t: 'TradeAdded', player: '', amount: 1, label: '+1 Trade' },
                            { t: 'DiscardOrScrapAndDrawChosen', player: '', maxCards: 2, action: 'discard', label: 'Discard up to 2, then draw that many' }
                        ],
                        card: 'RECYCLINGSTATION' 
                    } } }
                ]
            }
        ]
    },
    WARWORLD: {
        id: 'WARWORLD',
        name: 'War World',
        cost: 5,
        faction: 'Star Empire',
        type: 'base',
        selfScrap: false,
        shield: 'outpost',
        defence: 4,
        text: {
            play: [`+3 Combat`],
            ally: [`+4 Combat`]
        },
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
                    { kind: 'addCombat', amount: 4 }
                ]
            }
        ]
    },
    ROYALREDOUBT: {
        id: 'ROYALREDOUBT',
        name: 'Royal Redoubt',
        cost: 6,
        faction: 'Star Empire',
        type: 'base',
        selfScrap: false,
        shield: 'outpost',
        defence: 6,
        text: {
            play: [`+3 Combat`],
            ally: [`Choose a player to discard`]
        },
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
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: false, data: { purpose: 'opponentDiscard' } } },
                ]
            }
        ]
    },
    // FLEETHQ: {
    //     id: 'FLEETHQ',
    //     name: 'Fleet HQ',
    //     cost: 8,
    //     faction: 'Star Empire',
    //     type: 'base',
    //     selfScrap: false,
    //     shield: 'normal',
    //     description: `When an imperial fleet goes into battle it's usually coordinated from afar by one of these mobile command centers`,
    //     defence: 8,
    //     text: {
    //         play: [`Gain combat for every ship played`],
    //     },
    //     abilities: [
    //         {
    //             trigger: 'onPlay',
    //             effects: [
                    
    //             ]
    //         },
    //     ]
    // },
    TRADEBOT: {
        id: 'TRADEBOT',
        name: 'Trade Bot',
        cost: 1,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        text: {
            play: [`+1 Trade`, `You may scrap a card in your hand or discard`],
            ally: [`+2 Combat`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 1 },
                    { kind: 'prompt', prompt: { kind: 'chooseOtherCardToScrap', optional: true } }
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
        text: {
            play: [`+2 Combat`, `You may scrap a card in your hand or discard`],
            ally: [`+2 Combat`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 2 },
                    { kind: 'prompt', prompt: { kind: 'chooseOtherCardToScrap', optional: true } }
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
        text: {
            play: [`+2 Trade`, `You may scrap a card in your hand or discard`],
            ally: [`+2 Combat`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addTrade', amount: 2 },
                    { kind: 'prompt', prompt: { kind: 'chooseOtherCardToScrap', optional: true } }
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
    BATTLESTATION: {
        id: 'BATTLESTATION',
        name: 'Battle Station',
        cost: 3,
        faction: 'Machine Cult',
        type: 'base',
        selfScrap: true,
        shield: 'outpost',
        description: "A Battle Station fusion core can double as a devastating weapon... once",
        defence: 5,
        text: {
            play: [],
            scrap: [`+5 Combat`]
        },
        abilities: [
            {
                trigger: 'onScrap',
                effects: [
                    { kind: 'addCombat', amount: 5 }
                ]
            }
        ]
    },
    PATROLMECH: {
        id: 'PATROLMECH',
        name: 'Patrol Mech',
        cost: 4,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        description: "With the Blobs an ever present danger even the Cult's  cargo carrying mechs bristle with firepower",
        text: {
            play: [`+3 Trade or +5 Combat`,],
            ally: [`You may scrap a card in your hand or discard`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseAbility', optional: false, data: { options:
                        [
                            { t: 'TradeAdded', amount: 3, label: '+3 Trade' },
                            { t: 'CombatAdded', amount: 5, label: '+5 Combat' }
                        ],
                        card: 'PATROLMECH'
                    }} }
                ]
            },
            {
                trigger: 'onAlly',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseOtherCardToScrap', optional: true } }
                ]
            }
        ]
    },
    STEALTHNEEDLE: {
        id: 'STEALTHNEEDLE',
        name: 'Stealth Needle',
        cost: 4,
        faction: 'Machine Cult',
        type: 'ship',
        selfScrap: false,
        description: "The Needle's ability to mimic other ships represents the pinnacle of Cult technology.",
        text: {
            play: [`Copy another ship you have played this turn.`, 'Needle ship has that ship\'s faction as well as Machine Cult'],
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseInPlayShip', optional: true } }
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
        text: {
            play: [`+4 Combat`, `You may scrap a card in your hand or discard`],
            ally: [`Draw 1 card`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 4 },
                    { kind: 'prompt', prompt: { kind: 'chooseOtherCardToScrap', optional: true } }
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
        text: {
            play: [`+6 Combat`, `May destroy a target base`],
            ally: [`Draw 1 card`]
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'addCombat', amount: 6 },
                    { kind: 'prompt', prompt: { kind: 'choosePlayer', optional: true, data: { purpose: 'destroyOpponentBase' } } }
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
    BRAINWORLD: {
        id: 'BRAINWORLD',
        name: 'Brain World',
        cost: 8,
        faction: 'Machine Cult',
        type: 'base',
        selfScrap: false,
        defence: 6,
        shield: 'outpost',
        description: "The Machine Cult build these supercomputing space station to run every aspect of their society. Now they worship them as gods",
        text: {
            play: [`Scrap up to 2, then draw that many`],
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'scrapAndDraw', maxCards: 2 }
                ]
            }
        ]
    },
    MACHINEBASE: {
        id: 'MACHINEBASE',
        name: 'Machine Base',
        cost: 7,
        faction: 'Machine Cult',
        type: 'base',
        selfScrap: false,
        defence: 6,
        shield: 'outpost',
        description: 'This high-tech city is like a beehive it looks chaotic but vital work is being done efficiently at a frenetic pace',
        text: {
            play: [`Draw 1 card`],
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'drawCards', amount: 1 }
                ]
            }
        ]
    },
    JUNKYARD: {
        id: 'JUNKYARD',
        name: 'Junkyard',
        cost: 6,
        faction: 'Machine Cult',
        type: 'base',
        selfScrap: false,
        defence: 5,
        shield: 'outpost',
        description: "The Machine Cult's first commandment. Thou shalt not wast tech",
        text: {
            play: [`You may scrap a card in your hand or discard`],
        },
        abilities: [
            {
                trigger: 'onPlay',
                effects: [
                    { kind: 'prompt', prompt: { kind: 'chooseOtherCardToScrap', optional: true } }
                ]
            }
        ]
    }
}