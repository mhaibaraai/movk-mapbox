<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

const position = ref<[number, number]>([116.397, 39.908])

const label = computed(() => `${position.value[0].toFixed(3)}, ${position.value[1].toFixed(3)}`)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/streets-v12', center: [116.397, 39.908], zoom: 12 }">
      <!-- 默认插槽自定义 DOM；draggable 时拖拽结束回写 v-model:lnglat -->
      <MapboxMarker v-model:lnglat="(position as LngLatLike)" :options="{ draggable: true }">
        <div class="flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg">
          <UIcon name="i-lucide-map-pin" class="size-4" />
        </div>
      </MapboxMarker>
      <div class="absolute left-3 top-3 z-10 rounded-(--ui-radius) border border-default bg-default/80 px-3 py-1.5 text-sm backdrop-blur">
        拖拽标记：{{ label }}
      </div>
    </MapboxMap>
  </div>
</template>
