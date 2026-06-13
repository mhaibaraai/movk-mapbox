<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [116.39, 39.91],
        zoom: 11,
        pitch: 55,
        bearing: -25
      }"
    >
      <!-- visualizePitch 让罗盘随俯仰角倾斜，showZoom 保留缩放按钮 -->
      <MapboxNavigationControl
        position="top-right"
        :options="{ visualizePitch: true, showCompass: true, showZoom: true }"
      />
    </MapboxMap>
  </div>
</template>
