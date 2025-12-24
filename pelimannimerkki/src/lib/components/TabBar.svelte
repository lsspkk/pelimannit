<script lang="ts">
  export let activeTab: 'randomize' | 'sheet';
  export let onTabChange: (tab: 'randomize' | 'sheet') => void;
</script>

<div class="bg-white border-b border-gray-300">
  <div class="flex">
    <button
      class="px-4 py-2 text-xs font-semibold border-b-2 transition-colors {activeTab === 'randomize' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
      on:click={() => onTabChange('randomize')}
    >
      Random
    </button>
    <button
      class="px-4 py-2 text-xs font-semibold border-b-2 transition-colors {activeTab === 'sheet' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
      on:click={() => onTabChange('sheet')}
    >
      Data
    </button>
  </div>
</div>
