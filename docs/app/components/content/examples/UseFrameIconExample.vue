<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/dark-v11', center: [116.397, 39.908], zoom: 13 }">
      <UseFrameIconLayerExample />
    </MapboxMap>
  </div>
</template>
