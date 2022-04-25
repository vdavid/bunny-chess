// TODO: Magic value!
const backendUrl = 'http://127.0.0.1:2000/'

export async function sendAndRetrieveState(id: string, fen: string): Promise<string> {
    const options = { method: 'GET', headers: { 'Content-Type': 'application/json', } }
    const urlWithQueryString = backendUrl + '?' + new URLSearchParams({ id, fen })
    const response = await fetch(urlWithQueryString, options)
    const json = await response.json()
    return json[id]
}

export async function sendState(id: string, fen: string): Promise<void> {
    await sendAndRetrieveState(id, fen)
}

export function retrieveState(id: string): Promise<string> {
    return sendAndRetrieveState(id, '')
}
