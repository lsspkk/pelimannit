import { writable } from 'svelte/store'

const STORAGE_KEY = 'pelimannit-settings'

export type NameSort = 'none' | 'asc' | 'desc'

type PersistedSettings = {
  hardestFirst: boolean
  favoritesFirst: boolean
  nameSort: NameSort
}

const DEFAULT_SETTINGS: PersistedSettings = {
  hardestFirst: true,
  favoritesFirst: false,
  nameSort: 'none',
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function loadSettingsFromStorage(): Partial<PersistedSettings> | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedSettings> | null
    if (!parsed || typeof parsed !== 'object') return null

    const out: Partial<PersistedSettings> = {}
    if (typeof parsed.hardestFirst === 'boolean') out.hardestFirst = parsed.hardestFirst
    if (typeof parsed.favoritesFirst === 'boolean') out.favoritesFirst = parsed.favoritesFirst
    if (parsed.nameSort === 'none' || parsed.nameSort === 'asc' || parsed.nameSort === 'desc') {
      out.nameSort = parsed.nameSort
    }
    return out
  } catch (err) {
    console.error('Failed to load settings:', err)
    return null
  }
}

function saveSettingsToStorage(settings: PersistedSettings) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

export const hardestFirst = writable(DEFAULT_SETTINGS.hardestFirst)
export const favoritesFirst = writable(DEFAULT_SETTINGS.favoritesFirst)
export const nameSort = writable<NameSort>(DEFAULT_SETTINGS.nameSort)

// Hydrate + persist (auto-save on change)
const loaded = loadSettingsFromStorage()
const current: PersistedSettings = { ...DEFAULT_SETTINGS, ...(loaded ?? {}) }

if (loaded) {
  hardestFirst.set(current.hardestFirst)
  favoritesFirst.set(current.favoritesFirst)
  nameSort.set(current.nameSort)
}

if (isBrowser()) {
  hardestFirst.subscribe((v) => {
    current.hardestFirst = v
    saveSettingsToStorage(current)
  })
  favoritesFirst.subscribe((v) => {
    current.favoritesFirst = v
    saveSettingsToStorage(current)
  })
  nameSort.subscribe((v) => {
    current.nameSort = v
    saveSettingsToStorage(current)
  })
}

export function toggleNameSort() {
  nameSort.update((current) => {
    if (current === 'none') return 'asc'
    if (current === 'asc') return 'desc'
    return 'none'
  })
}

export function resetNameSort() {
  nameSort.set('none')
}
