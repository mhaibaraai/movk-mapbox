<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [105, 30], zoom: 1.5 }">
      <MaplibreGlobeControl position="top-right" />
    </MaplibreMap>
  </div>
</template>
