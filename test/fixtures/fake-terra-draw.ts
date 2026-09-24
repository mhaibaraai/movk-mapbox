import type { Feature } from 'geojson'

type Listener = (...args: unknown[]) => void
type StoreFeature = Feature & { id: string | number, properties: Record<string, unknown> }

/** 所有已创建的 fake 实例，按创建顺序 */
export const draws: FakeTerraDraw[] = []

/** 记录调用的最小 TerraDraw 替身：内存 store + 事件总线 */
export class FakeTerraDraw {
  store: StoreFeature[] = []
  mode = 'static'
  started = false
  startCalls = 0
  stopCalls = 0
  /** 模拟适配器注销时旧样式的源已不存在：先禁用实例再抛错（与 terra-draw 真实行为一致） */
  stopThrows = false
  addCalls = 0
  setModeCalls = 0
  /** updateModeOptions 调用记录：[模式名, 选项] */
  modeOptionUpdates: [string, unknown][] = []
  modes: { mode: string }[]
  private listeners: Record<string, Set<Listener>> = {}
  private nextId = 0

  constructor(options: { modes: { mode: string }[] }) {
    this.modes = options.modes
    draws.push(this)
  }

  start() {
    this.started = true
    this.startCalls++
  }

  stop() {
    this.started = false
    this.stopCalls++
    if (this.stopThrows) throw new Error('There is no source with this ID=td-point')
  }

  on(event: string, fn: Listener) {
    (this.listeners[event] ??= new Set()).add(fn)
  }

  off(event: string, fn: Listener) {
    this.listeners[event]?.delete(fn)
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners[event]?.forEach(fn => fn(...args))
  }

  listenerCount() {
    return Object.values(this.listeners).reduce((sum, set) => sum + set.size, 0)
  }

  getMode() {
    return this.mode
  }

  setMode(mode: string) {
    this.setModeCalls++
    this.mode = mode
  }

  updateModeOptions(mode: string, options: unknown) {
    if (!this.modes.some(m => m.mode === mode)) throw new Error('No mode with this name present')
    this.modeOptionUpdates = [...this.modeOptionUpdates, [mode, options]]
  }

  getFeatureId() {
    return `generated-${this.nextId++}`
  }

  getSnapshot() {
    return this.store.map(f => ({ ...f, properties: { ...f.properties } }))
  }

  addFeatures(features: StoreFeature[]) {
    this.addCalls++
    return features.map((feature) => {
      const valid = typeof feature.properties?.mode === 'string'
      if (valid) this.store = [...this.store, feature]
      return { id: feature.id, valid, ...(valid ? {} : { reason: 'Mode not registered' }) }
    })
  }

  hasFeature(id: string | number) {
    return this.store.some(f => f.id === id)
  }

  removeFeatures(ids: (string | number)[]) {
    this.store = this.store.filter(f => !ids.includes(f.id))
    this.emit('change', ids, 'delete')
  }

  clear() {
    const ids = this.store.map(f => f.id)
    this.store = []
    if (ids.length) this.emit('change', ids, 'delete')
  }

  updateFeatureProperties(id: string | number, properties: Record<string, unknown>) {
    this.store = this.store.map(f => (f.id === id ? { ...f, properties: { ...f.properties, ...properties } } : f))
    this.emit('change', [id], 'update', { target: 'properties' })
  }
}

export class FakeMapLibreGLAdapter {
  constructor(public config: unknown) {}
}
