<script setup lang="ts">
import type { ProjectionDefinitionSpecification } from '@maplibre/maplibre-gl-style-spec'

// zoom 10 以下为球体，10~12 之间平滑过渡为平面墨卡托
const type: ProjectionDefinitionSpecification = ['interpolate', ['linear'], ['zoom'], 10, 'vertical-perspective', 12, 'mercator']
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.91], zoom: 3 }">
      <MaplibreProjection :type="type" />
      <MaplibreNavigationControl position="top-right" />
    </MaplibreMap>
  </div>
</template>
