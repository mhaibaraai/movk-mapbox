<script setup lang="ts">
import type { SearchResult } from '#mapbox/types'

type SearchType = 'inView' | 'polygon' | 'district' | 'category' | 'statistics'

const type = ref<SearchType>('inView')
const keyword = ref('银行')
const specify = ref('156310000')
const dataTypes = ref('金融,餐饮')
const loading = ref(false)
const error = ref<string>()
const result = ref<SearchResult>()

// 陆家嘴附近的视野范围与闭合多边形，供 inView/polygon 两种类型演示
const bounds: [number, number, number, number] = [121.47, 31.22, 121.52, 31.25]
const polygon: [number, number][] = [
  [121.48, 31.23],
  [121.51, 31.23],
  [121.51, 31.25],
  [121.48, 31.25],
  [121.48, 31.23]
]

const { fitBounds } = useMapboxCamera({ mapId: 'tianditu-search-types-demo' })

const categories = computed(() => (result.value?.kind === 'categories' ? result.value.categories : []))
const pois = computed(() => {
  if (result.value?.kind === 'poi') return result.value.pois
  if (result.value?.kind === 'categories') return result.value.categories.flatMap(c => c.pois)
  return []
})
const priorityCities = computed(() => (result.value?.kind === 'statistics' ? result.value.statistics.priorityCities : []))

async function query() {
  loading.value = true
  error.value = undefined
  try {
    result.value = await $fetch<SearchResult>('/api/tianditu-search-types', {
      query: {
        type: type.value,
        keyword: keyword.value || undefined,
        specify: specify.value || undefined,
        dataTypes: dataTypes.value || undefined,
        bounds: bounds.join(','),
        polygon: polygon.map(p => p.join(',')).join(';')
      }
    })
    if (pois.value.length) fitBounds({ type: 'MultiPoint', coordinates: pois.value.map(p => p.location) }, { padding: 60 })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

onMounted(query)

const typeItems: { label: string, value: SearchType }[] = [
  { label: '视野内搜索 inView', value: 'inView' },
  { label: '多边形搜索 polygon', value: 'polygon' },
  { label: '行政区域搜索 district', value: 'district' },
  { label: '数据分类搜索 category', value: 'category' },
  { label: '统计搜索 statistics', value: 'statistics' }
]

const state = computed(() => ({
  loading: loading.value,
  error: error.value ?? null,
  type: type.value,
  kind: result.value?.kind ?? null,
  pois: pois.value.map(p => p.name),
  categories: categories.value.map(c => `${c.name}(${c.count})`),
  priorityCities: priorityCities.value.map(c => `${c.name}(${c.count})`)
}))
</script>

<template>
  <MapShowcase
    title="天地图地名搜索 · 其余 5 种 queryType"
    description="createTianditu().search() 一个入口覆盖天地图 7 种 queryType；locate/searchNearby 已演示 normal/nearby，本页演示剩余 inView（视野内）、polygon（多边形）、district（行政区域）、category（数据分类）、statistics（统计）5 种。"
    :state="state"
  >
    <template #toolbar>
      <USelect
        v-model="type"
        :items="typeItems"
        value-key="value"
        size="sm"
        class="w-44"
        @update:model-value="query"
      />
      <UInput
        v-if="type === 'inView' || type === 'polygon' || type === 'district' || type === 'statistics'"
        v-model="keyword"
        placeholder="关键词"
        size="sm"
        class="w-28"
      />
      <UInput
        v-if="type === 'district' || type === 'category' || type === 'statistics'"
        v-model="specify"
        placeholder="行政区编码"
        size="sm"
        class="w-32"
      />
      <UInput v-if="type === 'category'" v-model="dataTypes" placeholder="分类，逗号分隔" size="sm" class="w-32" />
      <UButton size="sm" :loading="loading" @click="query">
        查询
      </UButton>
    </template>

    <DemoMap map-id="tianditu-search-types-demo" :center="[121.495, 31.24]" :zoom="13">
      <MapboxLayer
        v-if="type === 'polygon'"
        layer-id="search-types-polygon"
        type="line"
        :source="{ type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [polygon] } } }"
        :paint="{ 'line-color': '#f59e0b', 'line-width': 2, 'line-dasharray': [2, 2] }"
      />

      <MapboxMarker v-for="(poi, index) in pois" :key="`poi-${index}`" :lnglat="poi.location">
        <div class="rounded-full bg-info size-3 ring-2 ring-white" :title="poi.name" />
      </MapboxMarker>

      <MapboxMarker v-for="(city, index) in priorityCities" :key="`city-${index}`" :lnglat="city.location">
        <div class="rounded-sm rotate-45 bg-warning size-2.5 ring-2 ring-white" :title="`${city.name}（${city.count}）`" />
      </MapboxMarker>
    </DemoMap>
  </MapShowcase>
</template>
