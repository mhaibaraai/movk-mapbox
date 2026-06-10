<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'

// useNavigation 由 unplugin AutoImport 从 playgrounds/play/app/composables 复用
const { components, items } = useNavigation()

const toaster = { position: 'top-center' as const, duration: 2000, expand: true }
</script>

<template>
  <UApp :locale="zh_cn" :toaster="toaster">
    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        class="bg-elevated/25"
        resizable
        collapsible
        :toggle="{ size: 'sm', variant: 'outline', class: 'ring-default' }"
      >
        <template #header="{ collapsed }">
          <RouterLink to="/" class="text-highlighted inline-flex items-center gap-2" aria-label="Home">
            <UIcon name="i-lucide-map" class="size-5" />
            <span v-if="!collapsed" class="font-semibold">Movk Mapbox · Vue</span>
          </RouterLink>
          <div v-if="!collapsed" class="flex items-center ms-auto">
            <UColorModeButton />
          </div>
        </template>

        <template #default="{ collapsed }">
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
          <RouterView />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
