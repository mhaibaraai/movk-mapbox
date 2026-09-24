<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [121.47, 31.23], zoom: 12, pitch: 45, bearing: -20 }">
      <MaplibreMinimap
        position="top-right"
        map-style="https://tiles.openfreemap.org/styles/positron"
        :zoom-offset="-5"
        :width="240"
        :height="160"
        color="#f43f5e"
      />
    </MaplibreMap>
  </div>
</template>
