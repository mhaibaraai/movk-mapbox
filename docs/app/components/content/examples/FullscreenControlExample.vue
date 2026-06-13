<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 10 }">
      <MapboxFullscreenControl position="top-right" />
    </MapboxMap>
  </div>
</template>
