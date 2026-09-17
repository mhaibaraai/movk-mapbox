<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }"
    >
      <MaplibreWindowBuilding
        source="openmaptiles"
        source-layer="building"
        :rows="10"
        :cols="6"
        lit-color="#fde68a"
        dark-color="#1f2937"
        :lit-ratio="0.45"
      />
    </MaplibreMap>
  </div>
</template>
