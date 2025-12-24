<script lang="ts">
  import { SHEET_ID, SHEET_GID } from '../services/sheetService';

  export let title: string;
  export let isRefreshing: boolean;
  export let onRefresh: () => void;

  let showMenu = false;

  function handleClickOutside(e: MouseEvent) {
    const target = e.target;
    if (showMenu && target instanceof Element && !target.closest('.menu-container')) {
      showMenu = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="flex items-center justify-between bg-gray-900 text-white p-2">
  <div class="text-sm font-bold">
    {title}
  </div>
  
  <div class="relative menu-container">
    <button 
      on:click|stopPropagation={() => showMenu = !showMenu}
      class="flex items-center justify-center w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
      title="Valikko"
      aria-label="Avaa valikko"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    </button>
    
    {#if showMenu}
      <div class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <a 
          href="https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid={SHEET_GID}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors"
          on:click={() => showMenu = false}
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
          Google Sheets
        </a>
        <button
          type="button"
          on:click={() => { onRefresh(); showMenu = false; }}
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
