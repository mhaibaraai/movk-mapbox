<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 10 }">
      <!-- 点击控件触发浏览器定位授权，授权后持续跟踪并显示方向锥 -->
      <MapboxGeolocateControl
        position="top-right"
        :options="{
          trackUserLocation: true,
          showUserHeading: true,
          positionOptions: { enableHighAccuracy: true }
        }"
      />
    </MapboxMap>
  </div>
</template>
