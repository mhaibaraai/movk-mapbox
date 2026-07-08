<script setup lang="ts">
import type { GeocodePoint, Poi, SearchResult } from '#mapbox/types'

const geocodeKeyword = ref('上海南浦大桥')
const poiKeyword = ref('银行')
const loading = ref(false)
const error = ref<string>()

const geocodeResult = ref<SearchResult>()
const forwardGeocodePoint = ref<GeocodePoint | null>()
const poiResults = ref<Poi[]>([])
const center = ref<[number, number]>()

const { flyTo } = useMapboxCamera({ mapId: 'tianditu-search-demo' })

// 从判别联合里取出可落点的 POI 列表与建议行政区
const geocodePois = computed<Poi[]>(() => (geocodeResult.value?.kind === 'poi' ? geocodeResult.value.pois : []))
const suggestionCities = computed(() =>
  geocodeResult.value?.kind === 'suggestion' ? geocodeResult.value.suggestion.admins.map(a => a.adminName) : []
)

async function runGeocode() {
  loading.value = true
  error.value = undefined
  poiResults.value = []
  try {
    const [locateResult, forwardPoint] = await Promise.all([
      $fetch<SearchResult>('/api/tianditu-geocode', { query: { keyword: geocodeKeyword.value } }),
      $fetch<GeocodePoint | null>('/api/tianditu-forward-geocode', { query: { address: geocodeKeyword.value } })
    ])
    geocodeResult.value = locateResult
    forwardGeocodePoint.value = forwardPoint
    // poi → 首个点；area → 中心点；其余（suggestion/empty）无落点
    const target = locateResult.kind === 'poi'
      ? locateResult.pois[0]?.location
      : locateResult.kind === 'area' ? locateResult.area.location : undefined
    center.value = target
    if (target) flyTo({ center: target, zoom: locateResult.kind === 'area' ? 10 : 15 })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function runSearchNearby() {
  if (!center.value) return
  loading.value = true
  error.value = undefined
  try {
    const { results } = await $fetch<{ results: Poi[] }>('/api/tianditu-search', {
      query: {
        keyword: poiKeyword.value,
        longitude: center.value[0],
        latitude: center.value[1],
        radius: 3000
      }
    })
    poiResults.value = results
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

onMounted(runGeocode)

const state = computed(() => ({
  'loading': loading.value,
  'error': error.value ?? null,
  'locate().kind': geocodeResult.value?.kind ?? null,
  'locate().pois': geocodePois.value.map(p => p.name),
  'locate().suggestionCities': suggestionCities.value,
  'geocode().location': forwardGeocodePoint.value?.location ?? null,
  'geocode().score': forwardGeocodePoint.value?.score ?? (forwardGeocodePoint.value === null ? '低置信度/无结果' : null),
  'poiResults': poiResults.value.map(p => p.name)
}))
</script>

<template>
  <MapShowcase
    title="天地图地名定位 / 周边检索"
    description="createTianditu().locate / geocode / searchNearby 是服务端专用（IP 白名单校验，不能在浏览器直接调用），本页通过 server/api 路由代理演示；同一关键词并排对比 locate（自动收窄+精确匹配优先，适合地标/地名）与 geocode（结构化地址精确编码，纯地标常因低置信度返回 null）。"
    :state="state"
  >
    <template #toolbar>
      <UInput v-model="geocodeKeyword" placeholder="地名，如：上海外滩" size="sm" class="w-40" />
      <UButton size="sm" :loading="loading" @click="runGeocode">
        locate / geocode 对比
      </UButton>
      <UInput v-model="poiKeyword" placeholder="POI 关键词，如：银行" size="sm" class="w-32" />
      <UButton size="sm" variant="soft" :loading="loading" :disabled="!center" @click="runSearchNearby">
        附近搜索
      </UButton>
    </template>

    <DemoMap map-id="tianditu-search-demo" :center="[121.4906, 31.2412]" :zoom="12">
      <MapboxMarker
        v-for="(poi, index) in geocodePois"
        :key="`geocode-${index}`"
        :lnglat="poi.location"
      >
        <div class="rounded-full bg-info size-3 ring-2 ring-white" :title="poi.name" />
      </MapboxMarker>

      <MapboxMarker v-if="forwardGeocodePoint" :lnglat="forwardGeocodePoint.location">
        <div class="rounded-full bg-warning size-3.5 ring-2 ring-white" title="geocode() 结果" />
      </MapboxMarker>

      <MapboxMarker
        v-for="poi in poiResults"
        :key="poi.name + poi.location[0]"
        :lnglat="poi.location"
      >
        <div class="rounded-sm rotate-45 bg-primary size-2.5 ring-2 ring-white" :title="[poi.name, poi.address].filter(Boolean).join(' · ')" />
      </MapboxMarker>
    </DemoMap>
  </MapShowcase>
</template>
