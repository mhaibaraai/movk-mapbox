<script setup lang="ts">
// 以天地图影像为例演示通用 WMTS（KVP）接入；tk 取自运行时配置，不硬编码
const tk = (useRuntimeConfig().public.maplibre as { tk?: string }).tk
const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 10 }">
      <MaplibreWmtsLayer
        url="https://t{s}.tianditu.gov.cn/img_w/wmts"
        layer="img"
        :subdomains="subdomains"
        :params="{ tk }"
        attribution="© 天地图"
      />
    </MaplibreMap>
  </div>
</template>
