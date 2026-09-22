<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.91], zoom: 10 }">
      <MaplibreFullscreenControl position="top-right" />
    </MaplibreMap>
  </div>
</template>
