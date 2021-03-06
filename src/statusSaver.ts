// TODO: Magic value!
const backendUrl = 'http://188.6.180.151:2000/'

export type BoardStatus = {
    fen: string
    lightElapsedMs: number
    darkElapsedMs: number
    lastUpdateDateTime: string
    gameStartDateTime: string
}

async function callBackend(url: string): Promise<{ [id: string]: BoardStatus }> {
    const options = { method: 'GET', headers: { 'Content-Type': 'application/json', 'Referrer-Policy': 'unsafe-url'} }
    return (await (await fetch(url, options)).json())
}

export async function sendState(id: string, fen: string, lightElapsedMs: number, darkElapsedMs: number, currentDateTime: string): Promise<BoardStatus> {
    return (await callBackend(backendUrl + '?' + new URLSearchParams({
        id,
        fen,
        lightElapsedMs: lightElapsedMs.toString(),
        darkElapsedMs: darkElapsedMs.toString(),
        currentDateTime
    })))[id]
}

export async function retrieveState(id: string): Promise<BoardStatus> {
    return (await callBackend(backendUrl + '?' + new URLSearchParams({ id })))[id]
}
