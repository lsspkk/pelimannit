<script lang="ts">
  import { favoritesStore } from '../stores/favoritesStore';
  import { hardestFirst, favoritesFirst, nameSort, toggleNameSort, resetNameSort } from '../stores/settingsStore';

  export let data: string[][];
  export let onRandomize: () => void;

  let showTooltip = false;
  let showFavoriteInfo = false;

  function handleGlobalClick(e: MouseEvent) {
    if (!showTooltip) return
    const target = e.target
    if (target instanceof HTMLElement && target.tagName !== 'BUTTON') {
      showTooltip = false
    }
  }

  function handleRowClick(songName: string) {
    favoritesStore.toggle(songName);
  }

  function handleRandomize() {
    resetNameSort();
    onRandomize();
  }

  function handleSettingChange() {
    resetNameSort();
    onRandomize();
  }

  function handleNameSortToggle() {
    toggleNameSort();
    onRandomize();
  }

  function handleClearFavorites() {
    favoritesStore.clear();
    resetNameSort();
    onRandomize();
    showFavoriteInfo = false;
  }
</script>

<svelte:window 
  on:keydown={(e) => { if (showTooltip && e.key === 'Escape') showTooltip = false; }} 
  on:click={handleGlobalClick}
/>

<div class="bg-white shadow-lg">
  <!-- Controls -->
  <div class="flex items-center justify-between p-2 border-b border-gray-300">
    <div class="flex gap-2">
      <label class="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" bind:checked={$favoritesFirst} on:change={handleSettingChange} class="w-3 h-3" />
        <span class="text-xs font-semibold text-gray-700">Suosikit ensin</span>
      </label>
      <label class="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" bind:checked={$hardestFirst} on:change={handleSettingChange} class="w-3 h-3" />
        <span class="text-xs font-semibold text-gray-700">Vaikein ensin</span>
      </label>
    </div>
    <button
      on:click={handleRandomize}
      class="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
    >
      Järjestä
    </button>
  </div>

  <div class="overflow-x-auto">
    {#if showTooltip}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-xl"
        role="button"
        tabindex="0"
        on:click={() => showTooltip = false}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showTooltip = false; }}
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
                on:click={handleNameSortToggle}
                class="ml-2 p-1 cursor-pointer hover:opacity-80"
                title={$nameSort === 'none' ? 'Järjestä nimellä' : $nameSort === 'asc' ? 'A→Z' : 'Z→A'}
              >
                {#if $nameSort === 'none'}
                  <span class="block w-8 h-8 leading-8 text-center text-xl text-white/60 select-none">⇅</span>
                {:else}
                  <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    {#if $nameSort === 'asc'}
                      <path d="M7 14l5-5 5 5H7z"/>
                    {:else if $nameSort === 'desc'}
                      <path d="M7 10l5 5 5-5H7z"/>
                    {/if}
                  </svg>
                {/if}
              </button>
            </div>
          </th>
          <th class="px-1 py-1 text-center font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af; width: 3ch;">
            <button 
              on:click|stopPropagation={() => showTooltip = !showTooltip}
              class="cursor-pointer hover:opacity-80"
            >
              ⓘ
            </button>
          </th>
          <th class="px-1 py-2 mx-auto font-semibold whitespace-nowrap" style="border: 1px solid #9ca3af; width: 2ch;">
            <button
              type="button"
              on:click|stopPropagation={() => showFavoriteInfo = true}
              class="ml-1 text-white/70 hover:text-white"
              title="Suosikit"
            >
              ★
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each data as row, i}
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <tr class="hover:bg-slate-50 transition-colors cursor-pointer" on:click={() => handleRowClick(row[0])}>
            <td class="px-1 py-1 text-gray-400 whitespace-nowrap" style="font-size: 0.625rem;">{i + 1}</td>
            <td class="px-2 py-1 text-xs text-slate-700 max-w-0 truncate" style="border: 1px solid #d1d5db;">{row[0] || ''}</td>
            <td class="px-1 py-1 text-slate-700 whitespace-nowrap text-center" style="border: 1px solid #d1d5db; font-size: 0.625rem;">{row[2] || ''}</td>
            <td class="px-1 py-1 text-center" style="border: 1px solid #d1d5db;">
              <span class="text-sm">{$favoritesStore.has(row[0]) ? '★' : '☆'}</span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if showFavoriteInfo}
    <div
      class="fixed inset-0 z-40"
    >
      <button
        type="button"
        class="absolute inset-0 w-full h-full bg-transparent"
        aria-label="Sulje suosikki-info"
        on:click={() => showFavoriteInfo = false}
      ></button>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-xl"
        role="dialog"
        aria-modal="true"
        tabindex="0"
        on:keydown={(e) => { if (e.key === 'Escape') showFavoriteInfo = false; }}
        on:click|stopPropagation
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
            on:click={() => showFavoriteInfo = false}
          >
            ✕
          </button>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <button
            type="button"
            class="flex-1 text-[11px] font-semibold text-slate-900 bg-slate-100 rounded px-2 py-1 hover:bg-slate-200"
            on:click={handleClearFavorites}
          >
            Poista valinnat
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
