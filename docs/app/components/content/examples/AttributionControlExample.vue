<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.91], zoom: 10 }">
      <!-- compact 折叠为图标按钮，customAttribution 追加自定义版权 -->
      <MaplibreAttributionControl
        position="bottom-right"
        :options="{ compact: true, customAttribution: '© MOVK MapLibre' }"
      />
    </MaplibreMap>
  </div>
</template>
