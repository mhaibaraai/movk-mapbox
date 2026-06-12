# AGENTS.md

声明式 Mapbox GL v3 封装库。同一套 `src/runtime/` 既作为 Nuxt 4 模块发布，也通过 unplugin/Vite 插件在纯 Vue + Vite 项目中使用。

## 常用命令

```bash
pnpm dev              # 启动 Nuxt playground（playgrounds/play）
pnpm dev:vue          # 启动纯 Vue + Vite playground（playgrounds/vue）
pnpm docs             # 启动文档站（docs，基于 Nuxt Content）
pnpm dev:prepare      # 首次克隆后必跑：stub 构建模块 + 预生成各 playground/docs 类型
pnpm build            # 构建模块（nuxt-module-build，产出 dist/）
pnpm lint             # ESLint 检查；pnpm lint:fix 自动修复
pnpm typecheck        # vue-tsc + 各 playground/docs 的 nuxt typecheck（覆盖三处构建）
pnpm test             # 运行 Vitest（happy-dom 环境）
```

运行单个测试：

```bash
pnpm vitest run test/layer.test.ts          # 单文件
pnpm vitest run -t "applies paint props"    # 按用例名过滤
pnpm vitest test/layer.test.ts              # 单文件 watch 模式
```

新增依赖或拉取代码后报类型/导入错误时，优先跑 `pnpm dev:prepare` 重新生成 stub 与 `.nuxt` 类型。

## 双分发架构

库的全部运行时实现都在 [src/runtime/](src/runtime/)，两条分发链共用它：

- Nuxt：[src/module.ts](src/module.ts) 用 `addComponentsDir` / `addImportsDir` 注册组件与 composables，把 token 写入 `runtimeConfig.public.mapbox`，并挂 `#mapbox` 别名指向 runtime。
- Vue + Vite：[src/unplugin.ts](src/unplugin.ts) 暴露 `MapboxUnplugin`，[src/vite.ts](src/vite.ts) / [src/vue-plugin.ts](src/vue-plugin.ts) 是对外入口。`mapboxComponentResolver` 与 `mapboxAutoImports` 也可注入到宿主已有的 unplugin 实例（如 @nuxt/ui 的单例）复用。

构建产物分两套：主模块走 `nuxt-module-build`（`pnpm build`）；`vite` / `unplugin` / `vue-plugin` 三个入口由 [build.config.ts](build.config.ts)（unbuild）单独产出。新增对外入口需同时改 `package.json` 的 `exports` 和 `build.config.ts`。

### 自动导入约定（关键）

- 组件解析按「裸文件名」匹配：`mapboxComponentResolver` 递归扫描 `components/` 下所有 `.vue`，以去掉目录与扩展名的文件名作为键。因此 **组件文件名必须全局唯一**，即使分布在不同子目录。加前缀（默认 `Mapbox`）后即为模板里的组件名。
- composables 目录下每个 `.ts` 自动成为导入项；其文件名即导出的函数名。
- 非 composable 的导出（标绘模式集合 `movkDrawModes`、主题工厂 `drawThemeStyles`）不在自动扫描范围，必须在 [src/module.ts](src/module.ts) 的 `addImports` 与 [src/unplugin.ts](src/unplugin.ts) 的 `UTIL_MANIFEST` **两处同步登记**。

### 运行时配置单例

[src/runtime/domains/map/config.ts](src/runtime/domains/map/config.ts) 用 `globalThis[Symbol.for('movk-mapbox:config')]` 持有 token 等配置。这样即便 Nuxt 与 Vue 双构建各自打包一份本模块，也共享同一份状态——`vue-plugin` 注入的配置才能被自动导入的运行时组件读到。改配置读写时不要破坏这个单例语义。

## 上下文注入与组件生命周期

地图实例不靠 id 查表传递，而是 provide/inject 下发上下文：

- [domains/map/context.ts](src/runtime/domains/map/context.ts) 的 `createMapboxContext` 返回「骨架 + attach」：`MapboxMap` 组件在 **setup 阶段同步 provide 上下文**（map 初始为 `undefined`），实例在 `onMounted` 才创建并 `attach`。子组件用 `useMap()` 注入，无需等地图就绪即可挂载。
- [domains/map/registry.ts](src/runtime/domains/map/registry.ts) 是纯 `id → context` 注册表，仅供跨树/跨路由访问（`useMapbox(id)`）和 `persistent` 复用，不是主反应式机制。

`onReady(callback)` 是子组件建 source/layer 的统一入口，语义不只是「加载完成一次」：

- `style.load` 在初次加载与每次 `setStyle` 后都触发，会重跑所有 `onReady` 回调，使切换底图后 source/layer 自动重建。
- 注册时若样式尚在加载窗口期，会监听 `styledata` / `sourcedata` / `idle` 多类事件，等 `isStyleLoaded()` 为真后补跑一次——缺一类都会导致动态增删图层或开关注记时回调永不触发。

新增声明式组件请遵循 [components/Layer.vue](src/runtime/components/Layer.vue) 的范式：`onReady` 里建、`watch` 里增量更新、`onUnmounted` 里拆，引用未就绪的 source 时监听 `sourcedata` 等待。相机参数（center/zoom/bearing/pitch）的 `v-model` 用「与地图现值比对、有差异才下发」断开回环，见 [components/Map.vue](src/runtime/components/Map.vue)。

## 注意事项

- 传给 mapbox API 的选项对象先用 `omitUndefined`（来自 `@movk/core`）剔除 `undefined`：mapbox 以 `key in options` 判定字段，残留 `undefined` 会污染相机矩阵（`+undefined → NaN`）。
- 地图实例只在客户端 `onMounted` 创建，组件已做 SSR 安全处理，使用方无需 `<ClientOnly>` 包裹。
- 本仓配置了 Mapbox 官方文档 MCP（[.mcp.json](.mcp.json) 的 `mapbox-docs-mcp`）；涉及 Mapbox GL API/style spec 时优先查它而非凭记忆。
- 坐标本土化：`utils/coordinate.ts`（gcoord，WGS84/GCJ02/BD09 转换）、`utils/tianditu.ts`（天地图底图）；缓冲/量算几何用 `@turf/*`。

## 撰写文档

文档站在 `docs/`（`@movk/nuxt-docs` + Nuxt Content），组件页结构对齐 movk / Nuxt UI，标题全中文。

### 页面结构（模板）

```md
## 简介
<组件定位与关键行为，1 段精炼说明；旁注用 ::note / ::tip>

## 用法
<一句话引入>
::component-example{name=<Basic> prettier}

## 示例
### <场景简单标题>
<一句话说明>
::component-example{name=<Scenario> prettier collapse}

## API
### Props / ### Emits / ### Slots

## Changelog
:commit-changelog{prefix="components"}
```

- `## 用法` 放基础示例，`## 示例` 放场景示例并以 `### 简单标题` 分节；不要再分「示例 / 实用示例」两段。
- 禁止无意义填充段落与连续大段纯文字；必要说明走 `::note` / `::tip`。
- 补齐 `seo`，其 `title` / `description` 用英文撰写。

### 示例约定

- 示例放 `docs/app/components/content/examples/` 下（拍平、不建子文件夹），文件名全局唯一且语义化（如 `LayerFilterExample.vue`）。
- 自包含内联：直接写 `<MapboxMap class="h-115" :options="...">`，**禁用 DemoMap**；底图按 play 规范选 `mapStyle` 或叠 `MapboxTiandituLayer`；容器高度用 `h-xxx`，不用内联 `style`。
- `::component-example` / `::component-code` 一律加 `prettier: true`；源码偏长加 `collapse: true`；交互参数用 `options`（`label` 用英文如 `color`，颜色项 name 以 `color` 结尾自动渲染色块）。
- `::component-code` 仅能渲染可独立挂载的组件；需要 `<MapboxMap>` 父级或定高容器的地图组件一律用自包含 `::component-example`。

### API 章节（自动抽取）

`:component-props` / `:component-emits` / `:component-slots` 经 component-meta 从 `src/runtime/components/*.vue` 源码 JSDoc 自动生成，slug 用带前缀的组件名：

```md
## API

### Props

:component-props{slug="MapboxLayer"}

### Emits

:component-emits{slug="MapboxLayer"}

### Slots

:component-slots{slug="MapboxLayer"}

## Changelog

:commit-changelog{prefix="components"}
```

- 改 API 表内容 = 改运行时组件源码 JSDoc（按 jsdoc 规范），不在 md 手写表格；composable / util 不在 component-meta 覆盖范围，需另行处理。
- `:commit-changelog` 路径 = `commitPath('src/runtime')` + `prefix/` + 组件名 + `.vue`；承载型页面（如 circle 用 MapboxLayer）加 `name=` 指向真实组件文件（`name="Layer"`）。
- 组件经 `defineExpose` 暴露实例时，补一个手写 `### Expose` 表（component-meta 不抽取 exposed）；用法细节先查 nuxt-docs MCP / 读 `@movk/nuxt-docs`。

### 侧栏分类

同一 section 内分组经页面 `category` frontmatter + [docs/app/composables/useCategory.ts](docs/app/composables/useCategory.ts) 注册实现，**URL 不变**。section 内所有页都应带 `category`，否则未归类页落入 "Overview" 组导致侧栏割裂。
