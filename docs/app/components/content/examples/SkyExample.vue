<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      :options="{
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [116.391, 39.908],
        zoom: 13,
        pitch: 75,
        maxPitch: 85,
        bearing: -20
      }"
    >
      <MaplibreSky
        :options="{
          'sky-color': '#199EF3',
          'horizon-color': '#f0f8ff',
          'fog-color': '#ffffff',
          'sky-horizon-blend': 0.5,
          'horizon-fog-blend': 0.6,
          'fog-ground-blend': 0.4
        }"
      />
    </MaplibreMap>
  </div>
</template>
