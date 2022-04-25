// TODO: Magic value!
const backendUrl = 'http://127.0.0.1:2000/'

type BoardStatus = {
    fen: string
    lightElapsedMs: number
    darkElapsedMs: number
    lastUpdateDateTime: number
}
type StatusResponse = {
    boards: { [id: string]: BoardStatus }
    startDateTime: number
}

export async function sendAndRetrieveState(id: string, fen: string, lightElapsedMs: number, darkElapsedMs: number, currentDateTime: number): Promise<StatusResponse> {
    const options = { method: 'GET', headers: { 'Content-Type': 'application/json', } }
    const urlWithQueryString = backendUrl + '?' + new URLSearchParams({
        id,
        fen,
        lightElapsedMs: lightElapsedMs.toString(),
        darkElapsedMs: darkElapsedMs.toString(),
        currentDateTime: currentDateTime.toString()
    })
    const response = await fetch(urlWithQueryString, options)
    return await response.json() as StatusResponse
}

export async function sendState(id: string, fen: string, lightElapsedMs: number, darkElapsedMs: number, currentDateTime: number): Promise<void> {
    await sendAndRetrieveState(id, fen, lightElapsedMs, darkElapsedMs, currentDateTime)
}

export function retrieveState(id: string): Promise<StatusResponse> {
    return sendAndRetrieveState(id, '', 0, 0, 0)
}
