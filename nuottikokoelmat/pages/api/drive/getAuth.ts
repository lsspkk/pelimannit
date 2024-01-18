import { google } from 'googleapis'

export const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
export const keyJson = Buffer.from(process.env.CREDENTIALS_BASE64 || '', 'base64').toString('ascii')

export async function getAuth() {
  try {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(keyJson),
      scopes: SCOPES,
    })
  } catch (error) {
    console.log(error)
  }
  return null
}
