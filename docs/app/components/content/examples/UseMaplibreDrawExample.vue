<script setup lang="ts">
import { defineComponent, h } from 'vue'
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])

// 子组件位于 <MaplibreDrawControl> 子树内，经 useMaplibreDraw() 注入绘制上下文并切换模式
const DrawModes = defineComponent({
  name: 'DrawModes',
  setup() {
    const { changeMode } = useMaplibreDraw()

    const button = (label: string, mode: string) =>
      h('button', {
        class: 'rounded bg-default/90 px-2 py-1 text-xs text-default ring ring-default hover:bg-elevated',
        onClick: () => changeMode(mode)
      }, label)

    return () => h('div', { class: 'absolute bottom-2 left-2 z-10 flex gap-1' }, [
      button('画点', 'point'),
      button('画线', 'linestring'),
      button('画面', 'polygon')
    ])
  }
})
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 11 }">
      <MaplibreDrawControl v-model:features="features" position="top-left">
        <DrawModes />
      </MaplibreDrawControl>
    </MaplibreMap>
    <div class="absolute right-2 top-2 z-10 rounded bg-default/90 px-2 py-1 text-xs text-default ring ring-default">
      已绘制 {{ features.length }} 个要素
    </div>
  </div>
</template>
