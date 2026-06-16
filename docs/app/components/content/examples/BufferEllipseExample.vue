<script setup lang="ts">
const center: [number, number] = [116.397, 39.908]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center, zoom: 11 }">
      <!-- x/y 半轴单位米，angle 为长轴方位角 -->
      <MapboxBufferEllipse
        :center="center"
        :x-semi-axis="3000"
        :y-semi-axis="1500"
        :angle="30"
        color="#f59e0b"
      />
    </MapboxMap>
  </div>
</template>
