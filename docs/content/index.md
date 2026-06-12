---
seo:
  title: Movk Mapbox — 声明式 Mapbox GL v3 封装库
  description: 用 MapboxMap / MapboxSource / MapboxLayer 等组件与 composables 声明式组合地图、数据源、图层、标记与控件；原生支持 Nuxt 4 模块，并经 Vite 插件在纯 Vue + Vite 项目中通用；内置绘制、天地图、WMS/WMTS 与多坐标系本土化。
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
:::motion
声明式 [Mapbox GL]{.text-primary} 组件库
:::

#description
:::motion
---
transition: { duration: 0.6, delay: 0.3 }
---
用组件组合地图、数据源、图层、标记、弹窗与控件。`MapboxContext` 注入架构让子组件经 `useMap()` 直接取实例，相机参数双向绑定，跨路由持久化；同一套组件在 Nuxt 4 与纯 Vue + Vite 下通用。内置绘制、天地图、WMS/WMTS 与多坐标系本土化支持。
:::

#links
:::motion{class="flex flex-wrap gap-x-6 gap-y-3"}
---
transition: { duration: 0.6, delay: 0.5 }
---
  ::::u-button
  ---
  to: /docs/getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  快速入门
  ::::

  ::::u-button
  ---
  icon: i-simple-icons-github
  color: neutral
  variant: outline
  size: xl
  to: https://github.com/mhaibaraai/movk-mapbox
  target: _blank
  ---
  查看源码
  ::::
:::

#default
:::motion{class="mx-auto"}
---
transition: { duration: 0.6, delay: 0.1 }
---
  ```vue [Map.vue]
  <script setup lang="ts">
  const center = ref<[number, number]>([116.397, 39.908])
  const zoom = ref(9)
  </script>

  <template>
    <MapboxMap v-model:center="center" v-model:zoom="zoom" :options="{ style: 'mapbox://styles/mapbox/streets-v12' }">
      <MapboxLayer
        layer-id="points"
        type="circle"
        :source="{ type: 'geojson', data: '/points.geojson' }"
        :paint="{ 'circle-radius': 8, 'circle-color': '#e11d48' }"
      />
      <MapboxNavigationControl position="top-right" />
    </MapboxMap>
  </template>
  ```
:::
::

::u-page-section{class="dark:bg-neutral-950"}
#title
核心特性

#description
声明式组合、上下文注入与双模式运行，从一张底图到复杂的三维效果与本土化底图服务，按需采用。

#features
  :::u-page-feature{icon="i-lucide-blocks"}
  #title
  声明式组合

  #description
  以组件组合地图、数据源、图层、标记、弹窗与控件，状态即视图，告别命令式的 add/remove 样板。
  :::

  :::u-page-feature{icon="i-lucide-share-2"}
  #title
  MapboxContext 注入

  #description
  根组件下发上下文，子组件经 useMap() 直接取实例与 isLoaded / whenLoaded()，无需 id 查表。
  :::

  :::u-page-feature{icon="i-lucide-move"}
  #title
  相机双向绑定

  #description
  v-model:center / zoom / bearing / pitch 双向同步相机参数，并支持跨路由 persistent 持久化。
  :::

  :::u-page-feature{icon="i-lucide-layers"}
  #title
  丰富图层与效果

  #description
  内置 circle/fill/line/symbol/heatmap 等类型，叠加聚合、建筑、扩散、雷达、迁徙、轨迹等动态效果。
  :::

  :::u-page-feature{icon="i-lucide-map"}
  #title
  本土化扩展

  #description
  天地图底图、WMS/WMTS 服务、mapbox-gl-draw 绘制与基于 gcoord 的多坐标系转换，开箱即用。
  :::

  :::u-page-feature{icon="i-lucide-package"}
  #title
  Nuxt / Vue 双模式

  #description
  既是 Nuxt 4 模块，也提供 @movk/mapbox/vite + vue-plugin，让同一套组件在纯 Vue + Vite 项目中通用。
  :::
::

::u-page-c-t-a
---
class: dark:bg-neutral-950
links:
  - label: Star on GitHub
    to: https://github.com/mhaibaraai/movk-mapbox
    target: _blank
    icon: i-lucide-star
    color: neutral
  - label: 快速入门
    to: /docs/getting-started
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
开始构建你的下一张地图

#description
从一张底图到三维建筑、动态效果与本土化底图服务，Movk Mapbox 用声明式组件把 Mapbox GL 的复杂度收敛为可组合的能力。
::
