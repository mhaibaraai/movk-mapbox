<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }"
    >
      <!-- three.js 公开的可平铺砖墙贴图 -->
      <MapboxTextureBuilding url="https://threejs.org/examples/textures/brick_diffuse.jpg" />
    </MapboxMap>
  </div>
</template>
