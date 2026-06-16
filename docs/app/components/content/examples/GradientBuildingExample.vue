<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }"
    >
      <MapboxGradientBuilding
        :stops="[[0, '#1e3a8a'], [80, '#0ea5e9'], [200, '#f59e0b'], [400, '#f43f5e']]"
        :opacity="0.9"
      />
    </MapboxMap>
  </div>
</template>
