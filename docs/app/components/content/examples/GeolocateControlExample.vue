<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.91], zoom: 10 }">
      <!-- 点击控件触发浏览器定位授权，授权后持续跟踪并显示位置与精度圈 -->
      <MaplibreGeolocateControl
        position="top-right"
        :options="{
          trackUserLocation: true,
          positionOptions: { enableHighAccuracy: true }
        }"
      />
    </MaplibreMap>
  </div>
</template>
