<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  /** 地图容器高度（MapboxMap 绝对定位铺满，须显式给定） */
  height?: string
  /** 右侧状态查看器内容；为 undefined 时不显示侧栏 */
  state?: unknown
  stateLabel?: string
}>(), {
  height: '460px'
})

defineSlots<{
  default: () => unknown
  toolbar: () => unknown
  aside: () => unknown
}>()
</script>

<template>
  <section class="flex flex-col gap-3 p-4 sm:p-6">
    <header v-if="title || $slots.toolbar" class="flex flex-wrap items-start justify-between gap-3">
      <div v-if="title" class="min-w-0">
        <h1 class="text-lg font-semibold text-highlighted">
          {{ title }}
        </h1>
        <p v-if="description" class="mt-1 text-sm text-muted">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.toolbar" class="flex flex-wrap items-center gap-2 shrink-0">
        <slot name="toolbar" />
      </div>
    </header>

    <div
      class="grid gap-4"
      :class="state !== undefined || $slots.aside ? 'lg:grid-cols-[1fr_320px]' : ''"
    >
      <div
        class="relative min-w-0 overflow-hidden rounded-lg border border-default bg-elevated/25"
        :style="{ height }"
      >
        <slot />
      </div>

      <aside v-if="state !== undefined || $slots.aside" class="min-w-0 flex flex-col gap-2">
        <slot name="aside">
          <div class="rounded-lg border border-default bg-default p-3">
            <p class="mb-2 text-xs font-medium uppercase text-dimmed">
              {{ stateLabel ?? 'State' }}
            </p>
            <pre class="overflow-auto text-xs text-muted whitespace-pre-wrap break-all">{{ JSON.stringify(state, null, 2) }}</pre>
          </div>
        </slot>
      </aside>
    </div>
  </section>
</template>
