<script lang="ts">
  export let data: string[][];
</script>

<div class="bg-white shadow-lg">
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
        {#each data as row}
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
