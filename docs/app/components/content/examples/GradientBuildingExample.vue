<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }"
    >
      <MaplibreGradientBuilding
        source="openmaptiles"
        source-layer="building"
        :stops="[[0, '#1e3a8a'], [80, '#0ea5e9'], [200, '#f59e0b'], [400, '#f43f5e']]"
        :opacity="0.9"
      />
    </MaplibreMap>
  </div>
</template>
