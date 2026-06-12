<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

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

// 默认 globe 投影；示例 zoom≥9 已处于 mercator 区间，天地图栅格渲染正确
const options = computed(() => ({
  projection: 'globe',
  style: props.mapStyle ?? basemapStyle.value,
  center: props.center,
  zoom: props.zoom,
  pitch: props.pitch,
  bearing: props.bearing
}))
</script>

<template>
  <MapboxMap :options="options" :persistent="persistent" :map-id="mapId">
    <MapboxTiandituLayer v-if="showTianditu && tiandituLayer" :layer="tiandituLayer" annotation />
    <slot />
  </MapboxMap>
</template>
