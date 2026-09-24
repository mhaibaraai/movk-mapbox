import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import MaplibreMap from '../../src/runtime/components/Map.vue'
import type { FakeStyleMap } from './fake-style-map'

/** 挂载 MaplibreMap 并派发 style.load；map 由测试文件的 maplibre-gl mock 产出，按创建顺序取最后一个 */
export async function mountInMap(created: FakeStyleMap[], children: () => unknown, mapProps: Record<string, unknown> = {}) {
  const wrapper = mount(defineComponent({
    setup() {
      return () => h(MaplibreMap, { options: {}, ...mapProps }, { default: children })
    }
  }), { attachTo: document.body })
  const map = created.at(-1)!
  map.fire('style.load')
  await flushPromises()
  const control = <T extends Element = HTMLElement>(selector: string) => map.controlContainer.querySelector<T>(selector)
  return { wrapper, map, control }
}
