<script setup lang="ts">
const mapId = 'define-maplibre-control-demo'
const home: [number, number] = [116.397, 39.908]

// 回调式定义控件：onAdd 返回 DOM 元素，点击回到原点
const control = defineMaplibreControl(
  (map) => {
    const group = document.createElement('div')
    group.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    const button = document.createElement('button')
    button.type = 'button'
    button.title = '回到原点'
    button.textContent = '⌖'
    button.addEventListener('click', () => map.flyTo({ center: home, zoom: 11 }))
    group.appendChild(button)
    return group
  },
  () => {}
)

onMounted(() => {
  useMaplibre(mapId)?.whenLoaded().then(map => map.addControl(control, 'top-right'))
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :map-id="mapId" :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: home, zoom: 11 }" />
  </div>
</template>
