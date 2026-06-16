<script setup lang="ts">
// 以天地图影像为例演示通用 WMTS（KVP）接入；tk 取自运行时配置，不硬编码
const tk = (useRuntimeConfig().public.mapbox as { tiandituToken?: string }).tiandituToken
const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 10 }">
      <MapboxWmtsLayer
        url="https://t{s}.tianditu.gov.cn/img_w/wmts"
        layer="img"
        :subdomains="subdomains"
        :params="{ tk }"
        attribution="© 天地图"
      />
    </MapboxMap>
  </div>
</template>
