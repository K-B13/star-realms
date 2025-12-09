import type { Event } from "../engine/events";

export const getActivePrompt = (events: Event[]): { prompt?: Event, resolver?: (e: Event) => boolean } => {
        const resolvers: Record<string, (e: Event) => boolean> = {
            scrapRow: (e: Event) => e.t === "PromptCancelled" || (e.t === "CardScrapped" && e.from === "row"),
            chooseRowForFree: (e: Event) => e.t === "PromptCancelled" || (e.t === "CardPurchased"),
            scrapSelf: (e: Event) => e.t === "PromptCancelled" || (e.t === "CardScrapped" && e.from === "inPlay"),
            choosePlayer: (e: Event) => e.t === "PromptCancelled"  || (e.t === "TargetChosen"),
            opponentDiscard: (e: Event) => e.t === "PromptCancelled" || (e.t === "CardDiscarded"),
            chooseOtherCardToScrap: (e: Event) => e.t === "PromptCancelled" || (e.t === "CardScrapped"),
            chooseAbility: (e: Event) => (e.t === "TradeAdded" || e.t === "CombatAdded" || e.t === "AuthorityAdded" || e.t === "DiscardOrScrapAndDrawChosen" || e.t === "DrawPerFactionCard"),
            chooseInPlayShip: (e: Event) => e.t === "PromptCancelled" || (e.t === "TargetCardChosen" && e.source === "copyShip"),
            copyShip: (e: Event) => e.t === "PromptCancelled" || (e.t === "TargetCardChosen" && e.source === "copyShip"),
            chooseOpponentBase: (e: Event) => e.t === "PromptCancelled" || (e.t === "BaseChosenToDestroy"),
            discardOrScrapAndDraw: (e: Event) => e.t === "PromptCancelled" || (e.t === "CardsDiscardedOrScrappedForDraw"),
        }
        
        for (let i = events.length - 1; i >= 0; i--) {
            const ev = events[i]
            if (ev.t !== 'PromptShown') continue;

            const kind = ev.kind as string | undefined
            const resolver = kind ? resolvers[kind] : undefined
            if (!resolver) continue;

            const resolved = events.slice(i + 1).some(resolver);
            if (!resolved) {
              return { prompt: ev as Extract<Event, { t: "PromptShown" }>, resolver };
            }
        }
        return {}
    }