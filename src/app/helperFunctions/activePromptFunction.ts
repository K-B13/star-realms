import type { Event } from "../engine/events";

export const getActivePrompt = (events: Event[]): { prompt?: Event, resolver?: (e: Event) => boolean } => {
        const resolvesScrapRow = (e: Event) => 
            e.t === "PromptCancelled" ||
            (e.t === "CardScrapped" && e.from === "row")

        for (let i = events.length - 1; i >= 0; i--) {
            const ev = events[i]
            if (ev.t !== 'PromptShown') continue;

            if (ev.kind === 'scrapRow') {
                const resolved = events.slice(i + 1).some(resolvesScrapRow)
                if (!resolved) {
                    return { prompt: ev, resolver: resolvesScrapRow }
                }
            }
        }
        return {}
    }