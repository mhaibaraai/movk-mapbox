<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 10 }">
      <MaplibreMinimap position="bottom-right" />
    </MaplibreMap>
  </div>
</template>
