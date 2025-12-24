<script lang="ts">
  export let message: string;
  export let visible: boolean;
  export let onClose: () => void;
</script>

{#if visible}
  <div class="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-sm">
    <span class="text-sm">{message}</span>
    <button
      type="button"
      on:click={onClose}
      class="text-white/70 hover:text-white transition-colors"
      aria-label="Sulje ilmoitus"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
{/if}
