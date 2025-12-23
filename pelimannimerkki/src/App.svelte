<script lang="ts">
  import { onMount } from 'svelte';
  import Papa from 'papaparse';
  import './app.css';

  const SHEET_ID = '1gyEze4GRZIsNwnO9UoCnb5oq6llJ9Nj8STkUKaY9qSo';
  const SHEET_GID = '1295352290'; // Sheet "2025" with "Hopeamerkki 2025 Joulukuu"
  
  let data: string[][] = [];
  let loading = true;
  let error = '';
  let activeTab: 'sheet' | 'randomize' = 'randomize';
  let randomizedData: string[][] = [];
  let hardestFirst = true;
  let favoritesFirst = false;
  let showTooltip = false;
  let favorites = new Set<string>();
  let nameSort: 'none' | 'asc' | 'desc' = 'none';
  let showFavoriteInfo = false;
  let showDataToast = false;
  let cachedDataDate = '';
  let showMenu = false;
  let isRefreshing = false;

  const CACHE_KEY = 'pelimannit-sheet-data';

  function saveDataToCache(data: string[][], date: string) {
    try {
      const cacheData = {
        data: data,
        cachedDate: date
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Failed to save data to cache:', err);
    }
  }

  function loadDataFromCache(): { data: string[][], cachedDate: string } | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Failed to load data from cache:', err);
    }
    return null;
  }

  function formatDateFinnish(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  // Load favorites from localStorage
  onMount(() => {
    const stored = localStorage.getItem('pelimannit-favorites');
    if (stored) {
      favorites = new Set(JSON.parse(stored));
    }
  });

  function toggleNameSort() {
    if (nameSort === 'none') nameSort = 'asc';
    else if (nameSort === 'asc') nameSort = 'desc';
    else nameSort = 'none';
    randomizeWithDistance();
  }

  function toggleFavorite(songName: string) {
    if (favorites.has(songName)) {
      favorites.delete(songName);
    } else {
      favorites.add(songName);
    }
    favorites = favorites; // Trigger reactivity
    localStorage.setItem('pelimannit-favorites', JSON.stringify([...favorites]));
  }

  function clearFavorites() {
    favorites = new Set();
    localStorage.setItem('pelimannit-favorites', JSON.stringify([]));
    randomizeWithDistance('reset');
    showFavoriteInfo = false;
  }

  function randomizeWithDistance(reset?: string) {
    if (data.length === 0) return;

    if (reset === 'reset') {
      nameSort = 'none';
    }

    // Filter out rows with less than 3 chars in column B (index 0)
    let workingData = [...data].filter(row => {
      const colB = row[0] || '';
      return colB.trim().length >= 3;
    });
    
    // Separate favorites and non-favorites
    const favoriteRows = workingData.filter(row => favorites.has(row[0]));
    const nonFavoriteRows = workingData.filter(row => !favorites.has(row[0]));

    function processGroup(group: string[][]) {
      if (hardestFirst) {
        // Group by difficulty
        const difficultyGroups = new Map<number, string[][]>();
        group.forEach(row => {
          const diff = parseInt(row[2]) || 999;
          if (!difficultyGroups.has(diff)) {
            difficultyGroups.set(diff, []);
          }
          difficultyGroups.get(diff)!.push(row);
        });

        // Sort difficulties (lowest first) and randomize within each group
        const sortedDiffs = Array.from(difficultyGroups.keys()).sort((a, b) => a - b);
        let result: string[][] = [];
        sortedDiffs.forEach(diff => {
          const subGroup = difficultyGroups.get(diff)!;
          // Fisher-Yates shuffle within group
          for (let i = subGroup.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [subGroup[i], subGroup[j]] = [subGroup[j], subGroup[i]];
          }
          result.push(...subGroup);
        });
        return result;
      } else {
        // Fisher-Yates shuffle
        const shuffled = [...group];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }
    }

    // Process based on favoritesFirst setting
    if (favoritesFirst) {
      // Process each group separately and combine favorites first
      const processedFavorites = processGroup(favoriteRows);
      const processedNonFavorites = processGroup(nonFavoriteRows);
      workingData = [...processedFavorites, ...processedNonFavorites];
    } else {
      // Combine groups first, then process as one
      const combinedRows = [...favoriteRows, ...nonFavoriteRows];
      workingData = processGroup(combinedRows);
    }

    // Apply distance algorithm to spread same dance types
    const result: string[][] = [];
    const pending = [...workingData];

    while (pending.length > 0) {
      let bestIndex = 0;
      let bestScore = -1;

      for (let i = 0; i < pending.length; i++) {
        const danceType = getDanceType(pending[i]);
        if (!danceType) {
          bestIndex = i;
          break;
        }

        // Calculate minimum distance to same dance type in result
        let minDistance = result.length;
        for (let j = result.length - 1; j >= 0; j--) {
          if (getDanceType(result[j]) === danceType) {
            minDistance = result.length - j;
            break;
          }
        }

        // Prefer songs with larger distance
        if (minDistance > bestScore) {
          bestScore = minDistance;
          bestIndex = i;
        }
      }

      result.push(pending[bestIndex]);
      pending.splice(bestIndex, 1);
    }

    // Apply name sorting if enabled
    if (nameSort !== 'none') {
      result.sort((a, b) => {
        const nameA = (a[0] || '').toLowerCase();
        const nameB = (b[0] || '').toLowerCase();
        return nameSort === 'asc' 
          ? nameA.localeCompare(nameB, 'fi')
          : nameB.localeCompare(nameA, 'fi');
      });
    }

    randomizedData = result;
  }

  const DANCE_TYPES = ['polska', 'valssi', 'vals', 'menuetti', 'polkka', 'marssi', 'sottiisi', 'schottis'];

  function getDanceType(row: string[]): string | null {
    // Check column C (index 1) for dance type
    const text = row[1]?.toLowerCase() || '';
    for (const type of DANCE_TYPES) {
      if (text.includes(type)) {
        return type === 'vals' ? 'valssi' : type === 'schottis' ? 'sottiisi' : type;
      }
    }
    return null;
  }

  onMount(async () => {
    // Load from cache first if available
    const cachedData = loadDataFromCache();
    if (cachedData) {
      data = cachedData.data;
      cachedDataDate = formatDateFinnish(cachedData.cachedDate);
      loading = false;
      randomizeWithDistance();
      showDataToast = true;
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        showDataToast = false;
      }, 5000);
    }

    // Fetch fresh data in background
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sheet data');
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        complete: (results) => {
          // Get rows 2-60 (index 1-59), columns B-J (index 1-9)
          const allData = results.data as string[][];
          const newData = allData.slice(1, 60).map(row => row.slice(1, 10));
          
          // Save to cache
          const currentDate = new Date().toISOString();
          saveDataToCache(newData, currentDate);
          
          // Update data if we didn't load from cache
          if (!cachedData) {
            data = newData;
            cachedDataDate = formatDateFinnish(currentDate);
            showDataToast = true;
            setTimeout(() => {
              showDataToast = false;
            }, 5000);
          } else {
            // Update silently if loaded from cache
            data = newData;
            cachedDataDate = formatDateFinnish(currentDate);
          }
          
          loading = false;
          // Automatically randomize on load
          randomizeWithDistance();
        },
        error: (err: any) => {
          if (!cachedData) {
            error = err.message;
            loading = false;
          }
        }
      });
    } catch (err) {
      if (!cachedData) {
        error = err instanceof Error ? err.message : 'Unknown error';
        loading = false;
      }
    }
  });

  async function refreshData() {
    isRefreshing = true;
    showMenu = false;
    
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sheet data');
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        complete: (results) => {
          // Get rows 2-60 (index 1-59), columns B-J (index 1-9)
          const allData = results.data as string[][];
          const newData = allData.slice(1, 60).map(row => row.slice(1, 10));
          
          // Save to cache
          const currentDate = new Date().toISOString();
          saveDataToCache(newData, currentDate);
          
          data = newData;
          cachedDataDate = formatDateFinnish(currentDate);
          isRefreshing = false;
          
          // Show toast with updated date
          showDataToast = true;
          setTimeout(() => {
            showDataToast = false;
          }, 5000);
          
          // Re-randomize
          randomizeWithDistance();
        },
        error: (err: any) => {
          error = err.message;
          isRefreshing = false;
        }
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      isRefreshing = false;
    }
  }
</script>

<svelte:window 
  on:keydown={(e) => { if (showTooltip && e.key === 'Escape') showTooltip = false; }} 
  on:click={(e) => {
    const target = e.target as HTMLElement;
    if (showMenu && !target.closest('.menu-container')) {
      showMenu = false;
    }
  }} 
/>

<main class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
  <div class="max-w-7xl mx-auto">
    <div class="flex items-center justify-between bg-gray-900 text-white p-2">
      <div class="text-sm font-bold">
        Hopeamerkki 2025 Joulukuu
      </div>
      
      <!-- Three-dot menu -->
      <div class="relative menu-container">
        <button 
          onclick={(e) => { e.stopPropagation(); showMenu = !showMenu; }}
          class="flex items-center justify-center w-8 h-8 text-xs font-semibold bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors"
          title="Valikko"
        >
          <span class="text-xl leading-none">⋮</span>
        </button>
        
        {#if showMenu}
          <div class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <a 
              href="https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid={SHEET_GID}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors"
              onclick={() => showMenu = false}
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              Google Sheets
            </a>
            <button
              type="button"
              onclick={refreshData}
              disabled={isRefreshing}
              class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 {isRefreshing ? 'animate-spin' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              {isRefreshing ? 'Päivitetään...' : 'Päivitä data'}
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white border-b border-gray-300">
      <div class="flex">
        <button
          class="px-4 py-2 text-xs font-semibold border-b-2 transition-colors {activeTab === 'randomize' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
          onclick={() => activeTab = 'randomize'}
        >
          Random
        </button>
        <button
          class="px-4 py-2 text-xs font-semibold border-b-2 transition-colors {activeTab === 'sheet' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
          onclick={() => activeTab = 'sheet'}
        >
          Data
        </button>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <p class="ml-4 text-slate-600">Ladataan dataa...</p>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 m-4">
        <p class="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    {:else}
      {#if activeTab === 'randomize'}
        <div role="presentation" class="bg-white shadow-lg" onclick={(e) => { if (showTooltip && e.target && (e.target as HTMLElement).tagName !== 'BUTTON') showTooltip = false; }}>
          <!-- Controls -->
          <div class="flex items-center justify-between p-2 border-b border-gray-300">
            <div class="flex gap-2">
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" bind:checked={favoritesFirst} onchange={() => randomizeWithDistance('reset')} class="w-3 h-3" />
                <span class="text-xs font-semibold text-gray-700">Suosikit ensin</span>
              </label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" bind:checked={hardestFirst} onchange={() => randomizeWithDistance('reset')} class="w-3 h-3" />
                <span class="text-xs font-semibold text-gray-700">Vaikein ensin</span>
              </label>
            </div>
            <button
              onclick={() => randomizeWithDistance('reset')}
              class="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
            >
              Järjestä
            </button>
          </div>

          <div class="overflow-x-auto">
            {#if showTooltip}
              <div 
                class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-xl"
                role="button"
                tabindex="0"
                onclick={() => showTooltip = false}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showTooltip = false; }}
              >
                Vaikeus:<br/>
                Pienempi luku = vaikeampi
              </div>
            {/if}
            <table class="w-full border-collapse">
              <thead class="bg-slate-800 text-white">
                <tr>
                  <th class="px-1 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af; width: 2ch;"></th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">
                    <div class="flex items-center justify-between">
                      <span>Nimi</span>
                      <button 
                        onclick={toggleNameSort}
                        class="ml-2 p-1 cursor-pointer hover:opacity-80"
                        title={nameSort === 'none' ? 'Järjestä nimellä' : nameSort === 'asc' ? 'A→Z' : 'Z→A'}
                      >
                        {#if nameSort === 'none'}
                          <span class="block w-8 h-8 leading-8 text-center text-xl text-white/60 select-none">⇅</span>
                        {:else}
                          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                            {#if nameSort === 'asc'}
                              <path d="M7 14l5-5 5 5H7z"/>
                            {:else if nameSort === 'desc'}
                              <path d="M7 10l5 5 5-5H7z"/>
                            {/if}
                          </svg>
                        {/if}
                      </button>
                    </div>
                  </th>
                  <th class="px-1 py-1 text-center font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af; width: 3ch;">
                    <button 
                      onclick={(e) => { e.stopPropagation(); showTooltip = !showTooltip; }}
                      class="cursor-pointer hover:opacity-80"
                    >
                      ⓘ
                    </button>
                  </th>
                  <th class="px-1 py-2 mx-auto font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af; width: 2ch;">
                    <button
                      type="button"
                      onclick={(e) => { e.stopPropagation(); showFavoriteInfo = true; }}
                      class="ml-1 text-white/70 hover:text-white"
                      title="Suosikit"
                    >
                      ★
                    </button>


                  </th>
                </tr>
              </thead>
              <tbody>
                {#each randomizedData as row, i}
                  <tr class="hover:bg-slate-50 transition-colors cursor-pointer" onclick={() => toggleFavorite(row[0])}>
                    <td class="px-1 py-1 text-gray-400 whitespace-nowrap" style="font-size: 0.625rem;">{i + 1}</td>
                    <td class="px-2 py-1 text-xs text-slate-700 max-w-0 truncate" style="border: 1px solid #d1d5db;">{row[0] || ''}</td>
                    <td class="px-1 py-1 text-slate-700 whitespace-nowrap text-center" style="border: 1px solid #d1d5db; font-size: 0.625rem;">{row[2] || ''}</td>
                    <td class="px-1 py-1 text-center" style="border: 1px solid #d1d5db;">
                      <span class="text-sm">{favorites.has(row[0]) ? '★' : '☆'}</span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          {#if showFavoriteInfo}
            <div
              class="fixed inset-0 z-40"
              role="presentation"
              onclick={() => showFavoriteInfo = false}
            >
              <div
                class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-xl"
                role="dialog"
                aria-modal="true"
                tabindex="0"
                onkeydown={(e) => { if (e.key === 'Escape') showFavoriteInfo = false; }}
                onclick={(event) => event.stopPropagation()}
              >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-xs font-semibold">Suosikit</p>
                  <p class="text-[11px] leading-tight text-slate-200">
                    Tähdellä merkityt rivit voi pitää näkyvillä Suosikit- ja Vaikein ensin -asetusvalinnoilla.
                  </p>
                </div>
                <button
                  type="button"
                  class="text-white/60 hover:text-white"
                  aria-label="Sulje suosikki-info"
                  onclick={() => showFavoriteInfo = false}
                >
                  ✕
                </button>
              </div>
                <div class="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    class="flex-1 text-[11px] font-semibold text-slate-900 bg-slate-100 rounded px-2 py-1 hover:bg-slate-200"
                    onclick={clearFavorites}
                  >
                    Poista valinnat
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {:else if activeTab === 'sheet'}
        <div class="bg-white shadow-lg">
          <!-- Top scrollbar -->
          <div class="overflow-x-auto" style="direction: rtl;">
            <div style="height: 1px; width: {data[0]?.length * 150}px;"></div>
          </div>
          
          <!-- Main table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead class="bg-slate-800 text-white">
                <tr>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">B</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">C</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">D</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">E</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">F</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">G</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">H</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">I</th>
                  <th class="px-2 py-1 text-left text-xs font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af;">J</th>
                </tr>
              </thead>
              <tbody>
                {#each data as row, i}
                  <tr class="hover:bg-slate-50 transition-colors">
                    {#each row as cell}
                      <td class="px-2 py-1 text-xs text-slate-700 whitespace-nowrap" style="border: 1px solid #d1d5db;">{cell || ''}</td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    {/if}
  </div>
  
  <!-- Toast notification -->
  {#if showDataToast && cachedDataDate}
    <div class="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-sm">
      <span class="text-sm">Data ladattu {cachedDataDate}</span>
      <button
        type="button"
        onclick={() => showDataToast = false}
        class="text-white/70 hover:text-white transition-colors"
        aria-label="Sulje ilmoitus"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  {/if}
</main>
