import { writable } from 'svelte/store'

const STORAGE_KEY = 'pelimannit-favorites'

function createFavoritesStore() {
  const { subscribe, set, update } = writable<Set<string>>(new Set())

  return {
    subscribe,

    load() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          set(new Set(JSON.parse(stored)))
        }
      } catch (err) {
        console.error('Failed to load favorites:', err)
      }
    },

    toggle(songName: string) {
      update((favorites) => {
        if (favorites.has(songName)) {
          favorites.delete(songName)
        } else {
          favorites.add(songName)
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]))
        return new Set(favorites)
      })
    },

    clear() {
      set(new Set())
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    },
  }
}

export const favoritesStore = createFavoritesStore()
