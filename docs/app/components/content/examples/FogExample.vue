<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{
        style: 'mapbox://styles/mapbox/standard',
        center: [116.391, 39.908],
        zoom: 15,
        pitch: 70,
        bearing: -20
      }"
    >
      <MapboxFog
        :options="{
          'color': '#dbeafe',
          'high-color': '#a5b4fc',
          'horizon-blend': 0.3,
          'space-color': '#0b1026',
          'star-intensity': 0.15,
          'range': [1, 12]
        }"
      />
    </MapboxMap>
  </div>
</template>
