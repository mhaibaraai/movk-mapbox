<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import { spriteFrame, spriteFrameRect } from '../../utils/sprite'
import { useMap } from '../../composables/useMap'
import { useFrameIcon } from '../../composables/useFrameIcon'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

/** 帧动画图标层:雪碧图切帧后由 StyleImageInterface.render 逐帧驱动 symbol 循环播放,零解码依赖。 */
const props = withDefaults(defineProps<{
  /** 点要素数据(GeoJSON 或其 URL) */
  data: GeoJSONSourceSpecification['data']
  /** 雪碧图 URL(所有帧拼一张图,行优先排布) */
  image: string
  /** 总帧数 */
  frames: number
  /** 列数,默认等于 frames(单行) */
  columns?: number
  /** 行数,默认 1 */
  rows?: number
  /** 单帧宽(像素);省略由图宽/列数推算 */
  frameWidth?: number
  /** 单帧高(像素);省略由图高/行数推算 */
  frameHeight?: number
  /** 播放帧率(帧/秒),默认 12 */
  fps?: number
  /** 上图图标边长(像素),默认 64 */
  size?: number
  /** 图层 id;省略时自动生成 */
  layerId?: string
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  fps: 12,
  size: 64
})

const ctx = useMap()
const id = props.layerId ?? `movk-sprite-${useId()}`
const imageName = `${id}-frames`

const source = computed<GeoJSONSourceSpecification>(() => ({ type: 'geojson', data: props.data }))

const layout = computed(() => ({
  'icon-image': imageName,
  'icon-allow-overlap': true,
  'icon-ignore-placement': true
}))

// 预切的逐帧 ImageData;无 canvas 环境(SSR/测试)保持空,render 自然跳过
const sliced = ref<ImageData[]>([])

// 帧驱动 StyleImageInterface 注册/兜底/清理(与 AnimatedImage 共用)
useFrameIcon({ imageName, size: props.size, frames: () => sliced.value, fps: props.fps })

function prepareFrames(): void {
  if (typeof Image === 'undefined') return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const columns = props.columns ?? props.frames
    const rows = props.rows ?? 1
    const grid = {
      columns,
      rows,
      frameWidth: props.frameWidth ?? img.width / columns,
      frameHeight: props.frameHeight ?? img.height / rows,
      frames: props.frames
    }
    const next: ImageData[] = []
    for (let i = 0; i < props.frames; i++) {
      const frame = spriteFrame(img, spriteFrameRect(i, grid), props.size)
      if (frame) next.push(frame)
    }
    sliced.value = next
    // 初始 sliced 为空时 render 不自驱,加载完触发一次以启动渲染循环
    ctx.map.value?.triggerRepaint()
  }
  img.src = props.image
}

prepareFrames()
watch(() => props.image, () => {
  sliced.value = []
  prepareFrames()
})
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer :layer-id="id" type="symbol" :source="id" :layout="layout" :before-id="beforeId" />
  </MapboxSource>
</template>
