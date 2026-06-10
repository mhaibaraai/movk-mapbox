<script setup lang="ts">
const lastClick = ref<string>('—')

function onClusterClick(payload: { clusterId: number, expansionZoom: number }) {
  lastClick.value = `聚合 #${payload.clusterId} → zoom ${payload.expansionZoom.toFixed(1)}`
}
function onPointClick(feature: { properties?: Record<string, unknown> | null }) {
  lastClick.value = `震级 ${feature.properties?.mag ?? '?'}`
}
</script>

<template>
  <MapShowcase
    title="ClusterLayer 点聚合"
    description="MapboxClusterLayer 便捷组件：geojson cluster 源 + 分级聚合圆/计数/散点三层预设；点击聚合圆自动放大展开。"
    :state="{ lastClick }"
  >
    <DemoMap :center="[-103.59, 40.66]" :zoom="3">
      <MapboxClusterLayer
        source-id="earthquakes"
        data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
        @cluster-click="onClusterClick"
        @point-click="onPointClick"
      />
    </DemoMap>
  </MapShowcase>
</template>
