<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }"
    >
      <MaplibreFlowBuilding source="openmaptiles" source-layer="building" color="#1e3a8a" flow-color="#67e8f9" />
    </MaplibreMap>
  </div>
</template>
