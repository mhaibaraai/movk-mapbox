<script setup lang="ts">
const center: [number, number] = [116.397, 39.908]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center, zoom: 11 }">
      <!-- bearing1 → bearing2（度，正北顺时针）扇面，半径单位米 -->
      <MapboxBufferSector
        :center="center"
        :radius="3000"
        :bearing1="30"
        :bearing2="120"
        color="#f43f5e"
      />
    </MapboxMap>
  </div>
</template>
