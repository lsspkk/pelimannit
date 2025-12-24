import { writable, derived } from 'svelte/store'

const CACHE_KEY = 'pelimannit-sheet-data'

interface CachedData {
  data: string[][]
  cachedDate: string
}

function createDataStore() {
  const { subscribe, set, update } = writable<string[][]>([])
  const cachedDate = writable<string>('')
  const loading = writable(true)
  const error = writable('')

  function formatDateFinnish(dateString: string): string {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  function loadFromCache(): CachedData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (err) {
      console.error('Failed to load data from cache:', err)
    }
    return null
  }

  function saveToCache(data: string[][], date: string) {
    try {
      const cacheData: CachedData = { data, cachedDate: date }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (err) {
      console.error('Failed to save data to cache:', err)
    }
  }

  return {
    subscribe,
    cachedDate: { subscribe: cachedDate.subscribe },
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },

    loadCached() {
      const cached = loadFromCache()
      if (cached) {
        set(cached.data)
        cachedDate.set(formatDateFinnish(cached.cachedDate))
        loading.set(false)
        return true
      }
      return false
    },

    setData(newData: string[][]) {
      const currentDate = new Date().toISOString()
      saveToCache(newData, currentDate)
      set(newData)
      cachedDate.set(formatDateFinnish(currentDate))
      loading.set(false)
    },

    setLoading(value: boolean) {
      loading.set(value)
    },

    setError(message: string) {
      error.set(message)
      loading.set(false)
    },
  }
}

export const dataStore = createDataStore()
