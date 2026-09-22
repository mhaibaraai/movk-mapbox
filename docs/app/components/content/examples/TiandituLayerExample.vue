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
    <MaplibreMap :options="{ center: [116.397, 39.908], zoom: 10 }">
      <MaplibreTiandituLayer
        :layer="layer"
        :annotation="annotation"
      />
    </MaplibreMap>
  </div>
</template>
