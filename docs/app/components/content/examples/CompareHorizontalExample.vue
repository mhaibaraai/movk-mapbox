<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreCompare orientation="horizontal" :position="0.4">
      <template #before>
        <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [121.47, 31.23], zoom: 10 }" />
      </template>
      <template #after>
        <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [121.47, 31.23], zoom: 10 }">
          <MaplibreNavigationControl position="bottom-right" />
        </MaplibreMap>
      </template>
    </MaplibreCompare>
  </div>
</template>
