<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }"
    >
      <!-- three.js 公开的可平铺砖墙贴图 -->
      <MaplibreTextureBuilding source="openmaptiles" source-layer="building" url="https://threejs.org/examples/textures/brick_diffuse.jpg" />
    </MaplibreMap>
  </div>
</template>
