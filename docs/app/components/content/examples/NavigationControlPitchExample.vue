<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      :options="{
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [116.39, 39.91],
        zoom: 11,
        pitch: 55,
        bearing: -25
      }"
    >
      <!-- visualizePitch 让罗盘随俯仰角倾斜，showZoom 保留缩放按钮 -->
      <MaplibreNavigationControl
        position="top-right"
        :options="{ visualizePitch: true, showCompass: true, showZoom: true }"
      />
    </MaplibreMap>
  </div>
</template>
