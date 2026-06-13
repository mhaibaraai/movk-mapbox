<script setup lang="ts">
withDefaults(defineProps <{
  layer?: 'vec' | 'img' | 'ter'
  annotation?: boolean
}> (), {
  layer: 'vec',
  annotation: true
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/empty-v9', center: [116.397, 39.908], zoom: 10 }">
      <MapboxTiandituLayer
        :layer="layer"
        :annotation="annotation"
      />
    </MapboxMap>
  </div>
</template>
