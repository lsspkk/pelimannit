import { Song } from './song'

export type AlternativeUrlResponse = { alternative: string; url: string; headers: Record<string, string> | undefined }

export async function fetchPdf(song: Song, alternativeUrl?: AlternativeUrlResponse): Promise<Blob> {
  if (!alternativeUrl) {
    return fetch(song.url, { method: 'GET', headers: { 'Content-Type': 'application/pdf' } }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch PDF: ${res.statusText}`)
      }
      return res.blob()
    })
  }

  const { url, headers } = alternativeUrl
  const { path, songname } = song
  const fetchUrl = `${url}/${path}/${songname}`
  const fetchHeaders = { 'Content-Type': 'application/pdf', ...headers }
  return fetch(fetchUrl, { method: 'GET', headers: fetchHeaders }).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.statusText}`)
    }
    return res.blob()
  })
}
