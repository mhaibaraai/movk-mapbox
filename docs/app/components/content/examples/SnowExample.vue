<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{
        style: 'mapbox://styles/mapbox/standard',
        center: [116.391, 39.908],
        zoom: 16,
        pitch: 60
      }"
    >
      <MapboxSnow :options="{ density: 0.85, intensity: 1, color: '#ffffff' }" />
    </MapboxMap>
  </div>
</template>
