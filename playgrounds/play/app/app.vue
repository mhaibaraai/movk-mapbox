<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'

const appConfig = useAppConfig()
const { components, groups, items } = useNavigation()

useHead({
  title: 'Movk Mapbox · Playground'
})
</script>

<template>
  <UApp :locale="zh_cn" :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />

    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        class="bg-elevated/25"
        resizable
        collapsible
        :toggle="{ size: 'sm', variant: 'outline', class: 'ring-default' }"
      >
        <template #header="{ collapsed }">
          <NuxtLink to="/" class="text-highlighted inline-flex items-center gap-2" aria-label="Home">
            <UIcon name="i-lucide-map" class="size-5" />
            <span v-if="!collapsed" class="font-semibold">Movk Mapbox</span>
          </NuxtLink>

          <div v-if="!collapsed" class="flex items-center ms-auto">
            <UColorModeButton />
          </div>
        </template>

        <template #default="{ collapsed }">
          <UDashboardSearchButton :collapsed="collapsed" />
          <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
          <USeparator type="dashed" />
          <UNavigationMenu
            :collapsed="collapsed"
            variant="link"
            :items="components"
            orientation="vertical"
          />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel>
        <template #body>
          <NuxtPage />
        </template>
      </UDashboardPanel>

      <UDashboardSearch :groups="groups" :fuse="{ resultLimit: 100 }" />
    </UDashboardGroup>
  </UApp>
</template>
