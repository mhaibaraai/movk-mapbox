import { readdirSync } from 'node:fs'
import { join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createUnplugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import Components from 'unplugin-vue-components'
import AutoImport from 'unplugin-auto-import'

export interface MapboxResolverOptions {
  /**
   * 组件前缀
   * @defaultValue 'Mapbox'
   */
  prefix?: string
}

export interface MapboxUnpluginOptions extends MapboxResolverOptions {
  /** 是否生成 components.d.ts / auto-imports.d.ts，默认 true */
  dts?: boolean
}

// runtime 目录：dev 经 jiti 解析到 src/runtime，发布时为 dist/runtime
const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

// 工具导出名 → runtime 下相对路径(标绘模式集合与主题工厂)，非 composables 目录、需显式登记
const UTIL_MANIFEST: Record<string, string> = {
  movkDrawModes: 'draw-modes',
  drawThemeStyles: 'utils/draw-theme'
}

// 递归收集 runtime/components 下 .vue：裸文件名(全局唯一) → 绝对路径
function componentMap(): Map<string, string> {
  const dir = join(runtimeDir, 'components')
  const map = new Map<string, string>()
  for (const file of readdirSync(dir, { recursive: true }) as string[]) {
    if (!file.endsWith('.vue')) continue
    map.set(file.slice(file.lastIndexOf(sep) + 1, -'.vue'.length), join(dir, file))
  }
  return map
}

/** Mapbox* 组件解析器，注入既有 unplugin-vue-components 实例（如 @nuxt/ui 的单实例）复用 */
export function mapboxComponentResolver(options: MapboxResolverOptions = {}) {
  const prefix = options.prefix ?? 'Mapbox'
  const map = componentMap()
  return {
    type: 'component' as const,
    resolve: (name: string) => {
      if (!name.startsWith(prefix)) return
      const from = map.get(name.slice(prefix.length))
      return from ? { name: 'default', from } : undefined
    }
  }
}

/** 本库 composables + 工具的自动导入项，注入既有 unplugin-auto-import 实例复用 */
export function mapboxAutoImports() {
  const cdir = join(runtimeDir, 'composables')
  const composables = (readdirSync(cdir) as string[])
    .filter(f => f.endsWith('.ts'))
    .map(f => f.slice(0, -'.ts'.length))
    .map(name => ({ from: join(cdir, name), imports: [name] }))
  const utils = Object.entries(UTIL_MANIFEST)
    .map(([name, file]) => ({ from: join(runtimeDir, file), imports: [name] }))
  return [...composables, ...utils]
}

export const MapboxUnplugin = createUnplugin<MapboxUnpluginOptions | undefined>((options = {}, meta) => {
  const dts = options.dts ?? true

  // unplugin-vue-components 与 unplugin-auto-import 内部依赖不同大版本的 unplugin，
  // meta 类型互不兼容；用各自 raw 的形参类型做局部适配（运行时结构一致）
  const components = Components.raw({
    dts,
    resolvers: [mapboxComponentResolver(options)]
  }, meta as Parameters<typeof Components.raw>[1])

  const autoImport = AutoImport.raw({
    dts,
    imports: mapboxAutoImports()
  }, meta as Parameters<typeof AutoImport.raw>[1])

  return [components, autoImport].flat() as UnpluginOptions[]
})
