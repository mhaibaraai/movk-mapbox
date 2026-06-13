<script setup lang="ts">
const mapId = 'define-mapbox-control-demo'
const home: [number, number] = [116.397, 39.908]

// 回调式定义控件：onAdd 返回 DOM 元素，点击回到原点
const control = defineMapboxControl(
  (map) => {
    const group = document.createElement('div')
    group.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
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
  useMapbox(mapId)?.whenLoaded().then(map => map.addControl(control, 'top-right'))
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: home, zoom: 11 }" />
  </div>
</template>
