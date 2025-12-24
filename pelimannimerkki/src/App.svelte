<script lang="ts">
  import { onMount } from 'svelte';
  import './app.css';
  
  import {
    Header,
    TabBar,
    Toast,
    DataView,
    RandomView,
    dataStore,
    favoritesStore,
    hardestFirst,
    favoritesFirst,
    nameSort,
    fetchSheetData,
    randomizeWithDistance
  } from './lib';

  const TOAST_DURATION = 5000;

  let activeTab: 'sheet' | 'randomize' = 'randomize';
  let randomizedData: string[][] = [];
  let showDataToast = false;
  let isRefreshing = false;

  let currentData: string[][] = [];
  let currentFavorites: Set<string> = new Set();
  let loading = true;
  let error = '';
  let cachedDate = '';

  // Subscribe to stores
  dataStore.subscribe(d => currentData = d);
  dataStore.loading.subscribe(l => loading = l);
  dataStore.error.subscribe(e => error = e);
  dataStore.cachedDate.subscribe(d => cachedDate = d);
  favoritesStore.subscribe(f => currentFavorites = f);

  function showToastNotification() {
    showDataToast = true;
    setTimeout(() => {
      showDataToast = false;
    }, TOAST_DURATION);
  }

  function doRandomize() {
    randomizedData = randomizeWithDistance(currentData, {
      hardestFirst: $hardestFirst,
      favoritesFirst: $favoritesFirst,
      nameSort: $nameSort,
      favorites: currentFavorites
    });
  }

  async function refreshData() {
    isRefreshing = true;
    
    try {
      const newData = await fetchSheetData();
      dataStore.setData(newData);
      showToastNotification();
      doRandomize();
    } catch (err) {
      dataStore.setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      isRefreshing = false;
    }
  }

  onMount(() => {
    // Load favorites
    favoritesStore.load();
    
    // Load cached data
    const hadCache = dataStore.loadCached();
    if (hadCache) {
      doRandomize();
      showToastNotification();
    }

    // Fetch fresh data
    fetchSheetData()
      .then(newData => {
        dataStore.setData(newData);
        if (!hadCache) {
          showToastNotification();
        }
        doRandomize();
      })
      .catch(err => {
        if (!hadCache) {
          dataStore.setError(err instanceof Error ? err.message : 'Unknown error');
        }
      });
  });

  // Re-randomize when settings or data change
  $: if (currentData.length > 0) {
    doRandomize();
  }
</script>

<main class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
  <div class="max-w-7xl mx-auto">
    <Header 
      title="Hopeamerkki 2025 Joulukuu"
      {isRefreshing}
      onRefresh={refreshData}
    />

    <TabBar 
      {activeTab}
      onTabChange={(tab) => activeTab = tab}
    />

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
        <RandomView 
          data={randomizedData}
          onRandomize={doRandomize}
        />
      {:else if activeTab === 'sheet'}
        <DataView data={currentData} />
      {/if}
    {/if}
  </div>
  
  <Toast 
    message="Data ladattu {cachedDate}"
    visible={showDataToast && !!cachedDate}
    onClose={() => showDataToast = false}
  />
</main>
