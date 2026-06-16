<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'

// 子组件位于 <MapboxMap> 子树内，经 useMap() 注入上下文读取实时相机状态
const MapStatus = defineComponent({
  name: 'MapStatus',
  setup() {
    const { isLoaded, onReady } = useMap()
    const center = ref('')
    const zoom = ref(0)

    onReady((map) => {
      const sync = () => {
        const c = map.getCenter()
        center.value = `${c.lng.toFixed(3)}, ${c.lat.toFixed(3)}`
        zoom.value = Number(map.getZoom().toFixed(2))
      }
      sync()
      map.on('move', sync)
    })

    return () => h('div', { class: 'absolute left-2 top-2 z-10 space-y-0.5 rounded bg-default/90 px-3 py-2 text-xs text-default ring ring-default' }, [
      h('div', `样式就绪：${isLoaded.value ? '是' : '否'}`),
      h('div', `中心：${center.value}`),
      h('div', `缩放：${zoom.value}`)
    ])
  }
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 10 }">
      <MapStatus />
    </MapboxMap>
  </div>
</template>
