import { Types } from 'mongoose'
import { Song } from './song'

type getFileMapResult = {
  fileMap: Map<Types.ObjectId, File>
  missingSongs: Song[]
}

const getPath = (song: Song): string => {
  const name = song.path + song.songname
  return name.normalize()
}

export const getFileName = (file: File): string => {
  const path = file.webkitRelativePath || file.name
  if (path.includes('@')) {
    // no webkitdirectory support, using flattened folder structure with @
    const start = path.includes('/') ? path.split('/').slice(1).join('/') : path
    const name = '/' + start.split('@').slice(0).join('/')
    return name.normalize()
  }
  // has webkitdirectory support
  const name = '/' + path.split('/').slice(1).join('/')
  return name.normalize()
}

export const getFileMap = (songs: Song[], files: File[]): getFileMapResult => {
  const pathToId = new Map<string, Types.ObjectId>()
  const idToSong = new Map<Types.ObjectId, Song>()
  for (const song of songs) {
    pathToId.set(getPath(song), song._id)
    idToSong.set(song._id, song)
  }

  const fileMap = new Map<Types.ObjectId, File>()
  for (const file of files) {
    const path = getFileName(file)
    console.debug('path', path)
    const songId = pathToId.get(path)
    if (songId) {
      fileMap.set(songId, file)
      pathToId.delete(path)
    }
    if (!songId) {
      console.log('no song found for file', path)
    }
  }
  const missingSongs = Array.from(pathToId.values()).map((id) => idToSong.get(id) as Song)
  return { fileMap, missingSongs }
}
