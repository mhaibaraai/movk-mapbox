<script setup lang="ts">
import { formatArea, formatDistance } from '@movk/mapbox/utils/measure'

const distances = [12, 850, 1234, 42000]
const areas = [50, 5000, 1_200_000, 9_000_000]
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="rounded-(--ui-radius) border border-default p-3">
      <div class="mb-2 text-sm font-medium text-default">
        formatDistance
      </div>
      <div v-for="m in distances" :key="m" class="flex justify-between font-mono text-xs">
        <span class="text-muted">{{ m }} m</span>
        <span class="text-default">{{ formatDistance(m) }}</span>
      </div>
    </div>
    <div class="rounded-(--ui-radius) border border-default p-3">
      <div class="mb-2 text-sm font-medium text-default">
        formatArea
      </div>
      <div v-for="m in areas" :key="m" class="flex justify-between font-mono text-xs">
        <span class="text-muted">{{ m }} m²</span>
        <span class="text-default">{{ formatArea(m) }}</span>
      </div>
    </div>
  </div>
</template>
