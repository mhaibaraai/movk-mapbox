<script setup lang="ts">
// ahocevar GeoServer：公共 WMS 演示服务（无需 token），topp:states 为美国各州
const url = 'https://ahocevar.com/geoserver/wms'
</script>

<template>
  <MapShowcase
    title="WMS 图层"
    description="MapboxWmsLayer 便捷组件：由结构化参数构造 WMS GetMap 栅格源，经 {bbox-epsg-3857} 占位符按瓦片请求。此处用 ahocevar GeoServer 公共服务。"
  >
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [-98, 39], zoom: 3 }">
      <MapboxWmsLayer
        :url="url"
        layers="topp:states"
        version="1.1.1"
        format="image/png"
        attribution="© ahocevar GeoServer"
      />
    </MapboxMap>
  </MapShowcase>
</template>
