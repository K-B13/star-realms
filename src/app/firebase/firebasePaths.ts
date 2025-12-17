export const allPlayersPath = () => `setup/players`

export const playerPath = (uid: string) => `setup/players/${uid}`

export const lobbyPath = (uid: string) => `setup/lobbies/${uid}`

export const allLobbyPath = () => `setup/lobbies`

export const playerLobbyPath = (lobbyUid: string, uid: string) => `setup/lobbies/${lobbyUid}/players/${uid}`

export const playerLobbyReadyPath = (lobbyUid: string, uid: string) => `setup/lobbies/${lobbyUid}/players/${uid}/ready`

export const gameStatePath = (gameUid: string) => `games/${gameUid}/gameState`

export const eventPath = (gameUid: string) => `games/${gameUid}/events`