import { barterWorldFactoryFunction } from './barterWorld'
import { centralOfficeFactoryFunction } from './centralOffice'
import { commandShipFactoryFunction } from './commandShip'
import { cutterFactoryFunction } from './cutter'
import { defenceCentreFactoryFunction } from './defenceCentre'
import { embassyYachtFactoryFunction } from './embassyYacht'
import { federationShuttleFactoryFunction } from './federationShuttle'
import { flagShipFactoryFunction } from './flagShip'
import { freighterFactoryFunction } from './freighter'
import { portOfCallFactoryFunction } from './portOfCall'
import { tradeEscortFactoryFunction } from './tradeEscort'
import { tradingPostFactoryFunction } from './tradingPost'

const tradeFederationCards = [
    // barterWorldFactoryFunction,
    // centralOfficeFactoryFunction,
    // commandShipFactoryFunction,
    // cutterFactoryFunction,
    // defenceCentreFactoryFunction,
    // embassyYachtFactoryFunction,
    { factoryFunction: federationShuttleFactoryFunction, amount: 3 },
    // flagShipFactoryFunction,
    // freighterFactoryFunction,
    // portOfCallFactoryFunction,
    // tradeEscortFactoryFunction,
    // tradingPostFactoryFunction
]

export default tradeFederationCards