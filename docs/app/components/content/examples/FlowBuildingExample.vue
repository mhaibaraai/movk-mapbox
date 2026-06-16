<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{ style: 'mapbox://styles/mapbox/dark-v11', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }"
    >
      <MapboxFlowBuilding color="#1e3a8a" flow-color="#67e8f9" />
    </MapboxMap>
  </div>
</template>
