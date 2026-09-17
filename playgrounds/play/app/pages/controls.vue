<script setup lang="ts">
const showNav = ref(true)
const showScale = ref(true)
const showFullscreen = ref(true)
const showGeolocate = ref(true)
const showAttribution = ref(true)
</script>

<template>
  <MapShowcase
    title="内置控件"
    description="五个声明式控件：NavigationControl / GeolocateControl / FullscreenControl / ScaleControl / AttributionControl，各自支持 position 与 options。"
  >
    <template #toolbar>
      <USwitch v-model="showNav" label="导航" />
      <USwitch v-model="showGeolocate" label="定位" />
      <USwitch v-model="showFullscreen" label="全屏" />
      <USwitch v-model="showScale" label="比例尺" />
      <USwitch v-model="showAttribution" label="版权" />
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="10">
      <MaplibreNavigationControl v-if="showNav" position="top-right" :options="{ visualizePitch: true }" />
      <MaplibreGeolocateControl v-if="showGeolocate" position="top-right" :options="{ trackUserLocation: true }" />
      <MaplibreFullscreenControl v-if="showFullscreen" position="top-right" />
      <MaplibreScaleControl v-if="showScale" position="bottom-left" :options="{ unit: 'metric' }" />
      <MaplibreAttributionControl v-if="showAttribution" position="bottom-right" :options="{ compact: true }" />
    </DemoMap>
  </MapShowcase>
</template>
