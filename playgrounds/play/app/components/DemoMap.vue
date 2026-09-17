<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

const props = defineProps<{
  center?: LngLatLike
  zoom?: number
  pitch?: number
  bearing?: number
  /** 覆盖全局底图切换器，用于强样式依赖的示例（style 为 Vue 保留属性，故命名 mapStyle） */
  mapStyle?: string
  persistent?: boolean
  mapId?: string
}>()

const { style: basemapStyle, isTianditu, tiandituLayer } = useBasemap()

// 传入 mapStyle 即脱离全局切换器（如 3D 建筑需特定样式），此时不叠加天地图
const overridden = computed(() => props.mapStyle !== undefined)
const showTianditu = computed(() => !overridden.value && isTianditu.value)

// MapLibre 默认 maxPitch 为 60，放宽以展示天空与地形
const options = computed(() => ({
  maxPitch: 85,
  style: props.mapStyle ?? basemapStyle.value,
  center: props.center,
  zoom: props.zoom,
  pitch: props.pitch,
  bearing: props.bearing
}))
</script>

<template>
  <MaplibreMap :options="options" :persistent="persistent" :map-id="mapId">
    <MaplibreTiandituLayer v-if="showTianditu && tiandituLayer" :layer="tiandituLayer" annotation />
    <slot />
  </MaplibreMap>
</template>
