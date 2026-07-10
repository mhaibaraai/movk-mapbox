<script setup lang="ts">
import { defineComponent, h } from 'vue'
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])

// 子组件位于 <MapboxDrawControl> 子树内，经 useMapboxDraw() 注入绘制上下文并切换模式
const DrawModes = defineComponent({
  name: 'DrawModes',
  setup() {
    const { changeMode } = useMapboxDraw()

    const button = (label: string, mode: string) =>
      h('button', {
        class: 'rounded bg-default/90 px-2 py-1 text-xs text-default ring ring-default hover:bg-elevated',
        onClick: () => changeMode(mode)
      }, label)

    return () => h('div', { class: 'absolute bottom-2 left-2 z-10 flex gap-1' }, [
      button('画点', 'draw_point'),
      button('画线', 'draw_line_string'),
      button('画面', 'draw_polygon')
    ])
  }
})
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 11 }">
      <MapboxDrawControl v-model:features="features" position="top-left">
        <DrawModes />
      </MapboxDrawControl>
    </MapboxMap>
    <div class="absolute right-2 top-2 z-10 rounded bg-default/90 px-2 py-1 text-xs text-default ring ring-default">
      已绘制 {{ features.length }} 个要素
    </div>
  </div>
</template>
