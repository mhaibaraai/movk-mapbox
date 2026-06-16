<script setup lang="ts">
const items = [
  { label: '预览', icon: 'i-lucide-eye', slot: 'preview' as const },
  { label: '代码', icon: 'i-lucide-code-xml', slot: 'code' as const }
]

const source = `\`\`\`vue
<template>
  <MapboxMap
    :options="{
      style: 'mapbox://styles/mapbox/light-v11',
      center: [116.461, 39.909],
      zoom: 15.5,
      pitch: 60,
      bearing: -20
    }"
  >
    <MapboxGradientBuilding
      :stops="[[0, '#1e3a8a'], [80, '#0ea5e9'], [200, '#f59e0b'], [400, '#f43f5e']]"
      :opacity="0.9"
    />
  </MapboxMap>
</template>
\`\`\``

const { data: ast } = await useAsyncData('home-hero-demo-source', () => cachedParseMarkdown(source))
</script>

<template>
  <UTabs
    :items="items"
    color="primary"
    variant="link"
    default-value="0"
    :unmount-on-hide="false"
    :ui="{
      root: 'gap-0 rounded-xl border border-default overflow-hidden bg-default shadow-sm',
      content: 'mt-0 p-2 h-90 sm:h-115'
    }"
  >
    <template #preview>
      <MapboxMap
        class="h-full w-full"
        :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20, interactive: false }"
      >
        <MapboxGradientBuilding
          :stops="[[0, '#1e3a8a'], [80, '#0ea5e9'], [200, '#f59e0b'], [400, '#f43f5e']]"
          :opacity="0.9"
        />
      </MapboxMap>
    </template>

    <template #code>
      <div
        class="h-full [&_div:has(>pre)]:my-0! [&_div:has(>pre)]:h-full [&_div:has(>pre)]:flex [&_div:has(>pre)]:flex-col [&_div:has(>pre)]:rounded-none! [&_div:has(>pre)]:border-0! [&_div:has(>pre)]:ring-0! [&_pre]:my-0! [&_pre]:min-h-0 [&_pre]:flex-1 [&_pre]:overflow-auto [&_pre]:rounded-none!"
      >
        <MDCRenderer v-if="ast" :body="ast.body" :data="ast.data" />
      </div>
    </template>
  </UTabs>
</template>
