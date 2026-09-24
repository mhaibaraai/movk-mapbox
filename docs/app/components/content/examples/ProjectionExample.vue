<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [105, 30], zoom: 1.5 }">
      <MaplibreProjection />
      <MaplibreSky
        :options="{
          'sky-color': '#199EF3',
          'horizon-color': '#f0f8ff',
          'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0]
        }"
      />
    </MaplibreMap>
  </div>
</template>
