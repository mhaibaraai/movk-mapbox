<script setup lang="ts">
const sections = [
  { label: '核心', icon: 'i-lucide-map', to: '/core/basic-map', description: '地图实例、相机双向绑定、跨路由持久化' },
  { label: '数据源', icon: 'i-lucide-database', to: '/sources/geojson', description: 'GeoJSON / Vector / Raster / Image 四类数据源' },
  { label: '图层', icon: 'i-lucide-layers', to: '/layers/circle', description: 'circle/line/fill/symbol/heatmap/3D 与内联 source' },
  { label: '标注', icon: 'i-lucide-map-pin', to: '/annotations/marker', description: 'Marker 与 Popup，支持自定义 DOM 与拖拽' },
  { label: '控件', icon: 'i-lucide-sliders-horizontal', to: '/controls', description: '导航/定位/全屏/比例尺/版权信息' },
  { label: '扩展', icon: 'i-lucide-puzzle', to: '/extensions/draw', description: 'Draw 绘制、天地图底图、坐标系转换' }
]
</script>

<template>
  <UPage>
    <UPageHero
      title="Movk Mapbox 能力演示"
      description="声明式 Mapbox GL v3 封装库的示例画廊，逐能力点穷举，兼作学习素材。"
      orientation="horizontal"
    />
    <UPageGrid class="p-4 sm:p-6 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UPageCard
        v-for="s in sections"
        :key="s.label"
        :title="s.label"
        :description="s.description"
        :icon="s.icon"
        :to="s.to"
        variant="subtle"
        spotlight
      />
    </UPageGrid>
  </UPage>
</template>
