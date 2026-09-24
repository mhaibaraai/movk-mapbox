import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { TerraDrawPointMode } from 'terra-draw'
import type { Feature } from 'geojson'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreDrawControl from '../src/runtime/components/extensions/DrawControl.vue'
import { draws } from './fixtures/fake-terra-draw'
import type { FakeTerraDraw } from './fixtures/fake-terra-draw'

// 可手动 fire 事件、记录控件增删的最小 fake gl Map
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const self = {
      controls: [] as { onAdd: (map: unknown) => HTMLElement, onRemove: () => void }[],
      on(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        ;(handlers[type] ??= new Set()).add(listener)
      },
      off(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        handlers[type]?.delete(listener)
      },
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
      },
      isStyleLoaded: () => true,
      addControl(control: { onAdd: (map: unknown) => HTMLElement, onRemove: () => void }) {
        self.controls.push(control)
      },
      removeControl(control: unknown) {
        self.controls = self.controls.filter(c => c !== control)
      },
      resize() {},
      remove() {},
      getCenter: () => ({ lng: 0, lat: 0 }),
      getZoom: () => 1,
      getBearing: () => 0,
      getPitch: () => 0,
      setStyle() {}
    }
    maps.push(self)
    return self
  }
  return { maps, makeFakeMap }
})

vi.mock('maplibre-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  function Noop() {}
  return {
    Map: FakeGlMap,
    LngLat: { convert: (v: unknown) => v },
    Marker: Noop,
    Popup: Noop
  }
})

vi.mock('terra-draw', async importOriginal => ({
  ...(await importOriginal<typeof import('terra-draw')>()),
  TerraDraw: (await import('./fixtures/fake-terra-draw')).FakeTerraDraw
}))

vi.mock('terra-draw-maplibre-gl-adapter', async () => ({
  TerraDrawMapLibreGLAdapter: (await import('./fixtures/fake-terra-draw')).FakeMapLibreGLAdapter
}))

const pointFeature: Feature = {
  type: 'Feature',
  id: 'f1',
  properties: {},
  geometry: { type: 'Point', coordinates: [116.39, 39.91] }
}

async function mountControlled(controlProps: Record<string, unknown> = {}) {
  const features = ref<Feature[]>([])
  const mode = ref<string>()
  const emitted: Record<string, unknown[][]> = {}
  const record = (name: string) => (...args: unknown[]) => {
    (emitted[name] ??= []).push(args)
  }
  const show = ref(true)
  const Parent = defineComponent({
    setup() {
      return () => h(MaplibreMap, { options: {} }, {
        default: () => show.value
          ? h(MaplibreDrawControl, {
              ...controlProps,
              'features': features.value,
              'onUpdate:features': (v: Feature[]) => {
                features.value = v
              },
              'mode': mode.value,
              'onUpdate:mode': (v: string) => {
                mode.value = v
              },
              'onFinish': record('finish'),
              'onDelete': record('delete'),
              'onModechange': record('modechange')
            })
          : null
      })
    }
  })
  const wrapper = mount(Parent)
  const map = maps[maps.length - 1]!
  // whenLoaded 在 load 事件后 resolve，等微任务续体执行完成
  map.fire('load')
  await nextTick()
  await nextTick()
  const draw = draws[draws.length - 1] as FakeTerraDraw
  return { wrapper, map, draw, features, mode, emitted, show }
}

function toolbar(map: ReturnType<typeof makeFakeMap>): HTMLElement {
  return map.controls[0]!.onAdd(map)
}

function button(el: HTMLElement, name: string): HTMLButtonElement {
  return el.querySelector<HTMLButtonElement>(`[data-mode="${name}"]`)!
}

beforeEach(() => {
  maps.length = 0
  draws.length = 0
})

describe('DrawControl 生命周期', () => {
  it('地图 load 后以默认模式集合创建并启动实例', async () => {
    const { draw } = await mountControlled()
    expect(draw.started).toBe(true)
    expect(draw.modes.map(m => m.mode)).toEqual(['select', 'point', 'linestring', 'polygon', 'rectangle', 'circle', 'ellipse', 'sector'])
  })

  it('卸载时停止实例、解绑事件并移除工具栏', async () => {
    const { map, draw, show } = await mountControlled()
    expect(map.controls).toHaveLength(1)

    show.value = false
    await nextTick()

    expect(draw.started).toBe(false)
    expect(draw.listenerCount()).toBe(0)
    expect(map.controls).toHaveLength(0)
  })

  it('切换底图（style.load）后重启实例并恢复要素与模式', async () => {
    const { map, draw, mode } = await mountControlled()
    // setStyle 已清空旧样式的源，适配器注销时 removeSource 抛错
    draw.stopThrows = true
    draw.store = [{ ...pointFeature, id: 'f1', properties: { mode: 'point' } }] as FakeTerraDraw['store']
    mode.value = 'polygon'
    await nextTick()

    map.fire('style.load')

    expect(draw.stopCalls).toBe(1)
    expect(draw.startCalls).toBe(2)
    expect(draw.started).toBe(true)
    expect(draw.store.map(f => f.id)).toEqual(['f1'])
    expect(draw.mode).toBe('polygon')
  })
})

describe('DrawControl 受控 features', () => {
  it('绘制完成回写模型且不回流 addFeatures（断环）', async () => {
    const { draw, features, emitted } = await mountControlled()

    draw.store = [{ ...pointFeature, properties: { mode: 'point' } }] as FakeTerraDraw['store']
    draw.emit('change', ['f1'], 'create')
    draw.emit('finish', 'f1', { mode: 'point', action: 'draw' })
    await nextTick()

    expect(features.value).toHaveLength(1)
    expect(emitted.finish?.[0]).toEqual(['f1', { mode: 'point', action: 'draw' }])
    expect(draw.addCalls).toBe(0)
  })

  it('styling 变更不触发回写', async () => {
    const { draw, features } = await mountControlled()
    draw.store = [{ ...pointFeature, properties: { mode: 'point' } }] as FakeTerraDraw['store']
    draw.emit('change', ['f1'], 'styling')
    await nextTick()
    expect(features.value).toEqual([])
  })

  it('外部赋值清空后按几何推断 mode 下发', async () => {
    const { draw, features } = await mountControlled()

    features.value = [pointFeature]
    await nextTick()

    expect(draw.addCalls).toBe(1)
    expect(draw.store[0]!.properties.mode).toBe('point')
    // 下发后以规范化要素回写一次，再次比对相等不重复下发
    await nextTick()
    expect(draw.addCalls).toBe(1)
  })

  it('删除事件派发 delete 并回写', async () => {
    const { draw, features, emitted } = await mountControlled()
    features.value = [pointFeature]
    await nextTick()

    draw.removeFeatures(['f1'])
    await nextTick()

    expect(features.value).toEqual([])
    expect(emitted.delete?.[0]).toEqual([['f1']])
  })
})

describe('DrawControl 受控 mode', () => {
  it('挂载后默认进入选择模式并回写', async () => {
    const { draw, mode } = await mountControlled()
    expect(draw.mode).toBe('select')
    expect(mode.value).toBe('select')
  })

  it('外部赋值切换模式并派发 modechange；与实例现值相同则跳过', async () => {
    const { draw, mode, emitted } = await mountControlled()
    const calls = draw.setModeCalls

    mode.value = 'polygon'
    await nextTick()
    expect(draw.mode).toBe('polygon')
    expect(emitted.modechange?.at(-1)).toEqual(['polygon'])

    mode.value = 'polygon'
    await nextTick()
    expect(draw.setModeCalls).toBe(calls + 1)
  })
})

describe('DrawControl 工具栏', () => {
  it('按模式集合渲染按钮，点击切换模式，再次点击回到选择模式', async () => {
    const { map, draw, mode } = await mountControlled()
    const el = toolbar(map)

    button(el, 'polygon').click()
    await nextTick()
    expect(draw.mode).toBe('polygon')
    expect(mode.value).toBe('polygon')
    expect(button(el, 'polygon').getAttribute('aria-pressed')).toBe('true')

    button(el, 'polygon').click()
    await nextTick()
    expect(draw.mode).toBe('select')
  })

  it('删除按钮移除当前选中要素', async () => {
    const { map, draw, features } = await mountControlled()
    const el = toolbar(map)

    features.value = [pointFeature]
    await nextTick()
    draw.emit('select', 'f1')
    el.querySelector<HTMLButtonElement>('[data-action="trash"]')!.click()
    await nextTick()

    expect(draw.store).toHaveLength(0)
    expect(features.value).toEqual([])
  })

  it('toolbar 为 false 时不添加工具栏', async () => {
    const { map } = await mountControlled({ toolbar: false })
    expect(map.controls).toHaveLength(0)
  })
})

describe('DrawControl modes', () => {
  it('按模式名子集注册，工具栏按钮与之一致', async () => {
    const { map, draw } = await mountControlled({ modes: ['select', 'rectangle', 'circle'] })
    expect(draw.modes.map(m => m.mode)).toEqual(['select', 'rectangle', 'circle'])

    const buttons = [...toolbar(map).querySelectorAll<HTMLButtonElement>('[data-mode]')]
    expect(buttons.map(b => b.dataset.mode)).toEqual(['select', 'rectangle', 'circle'])
  })

  it('混入自定义 terra-draw 实例，工具栏以模式名作标题', async () => {
    const custom = new TerraDrawPointMode({ modeName: 'marker' })
    const { map, draw } = await mountControlled({ modes: ['select', custom] })
    expect(draw.modes[1]).toBe(custom)
    expect(button(toolbar(map), 'marker').title).toBe('marker')
  })

  it('缺少选择模式时进入首个模式', async () => {
    const { draw, mode } = await mountControlled({ modes: ['polygon'] })
    expect(draw.mode).toBe('polygon')
    expect(mode.value).toBe('polygon')
  })
})

describe('DrawControl theme', () => {
  it('theme 变更原地更新按名解析模式的样式，不重建实例', async () => {
    const theme = ref({ color: '#111111' })
    const custom = new TerraDrawPointMode({ modeName: 'marker' })
    const Parent = defineComponent({
      setup: () => () => h(MaplibreMap, { options: {} }, {
        default: () => h(MaplibreDrawControl, { modes: ['select', 'polygon', custom], theme: theme.value })
      })
    })
    mount(Parent)
    maps[0]!.fire('load')
    await nextTick()
    await nextTick()
    const draw = draws[0] as FakeTerraDraw

    theme.value = { color: '#222222' }
    await nextTick()

    expect(draws).toHaveLength(1)
    expect(draw.modeOptionUpdates.map(([name]) => name)).toEqual(['select', 'polygon'])
    const styles = (draw.modeOptionUpdates[1]![1] as { styles: Record<string, (f: unknown) => unknown> }).styles
    expect(styles.fillColor!({ properties: {} })).toBe('#222222')
  })

  it('theme 值未变（新对象同内容）时跳过更新', async () => {
    const theme = ref({ color: '#111111' })
    const Parent = defineComponent({
      setup: () => () => h(MaplibreMap, { options: {} }, {
        default: () => h(MaplibreDrawControl, { theme: theme.value })
      })
    })
    mount(Parent)
    maps[0]!.fire('load')
    await nextTick()
    await nextTick()

    theme.value = { color: '#111111' }
    await nextTick()

    expect((draws[0] as FakeTerraDraw).modeOptionUpdates).toHaveLength(0)
  })
})
