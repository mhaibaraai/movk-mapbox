<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 10 }">
      <!-- compact 折叠为图标按钮，customAttribution 追加自定义版权 -->
      <MapboxAttributionControl
        position="bottom-right"
        :options="{ compact: true, customAttribution: '© MOVK Mapbox' }"
      />
    </MapboxMap>
  </div>
</template>
