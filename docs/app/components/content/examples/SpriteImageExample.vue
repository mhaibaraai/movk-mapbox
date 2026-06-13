<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 13 }">
      <!-- Phaser 公开雪碧图：18 帧 37×45 单行 -->
      <MapboxSpriteImage
        :data="data"
        image="https://labs.phaser.io/assets/sprites/metalslug_mummy37x45.png"
        :frames="18"
        :columns="18"
        :frame-width="37"
        :frame-height="45"
        :fps="12"
        :size="90"
      />
    </MapboxMap>
  </div>
</template>
