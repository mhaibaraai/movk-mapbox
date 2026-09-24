<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [121.47, 31.23], zoom: 10 }">
      <MaplibreNavigationControl position="top-right" />
      <MaplibreSwipe
        orientation="horizontal"
        :position="0.4"
        map-style="https://tiles.openfreemap.org/styles/dark"
      />
    </MaplibreMap>
  </div>
</template>
