# 文档完善任务 — 续作交接

> 本文件供新对话/新环境无缝接续「全量组件文档完善」任务。**撰写规范以 [AGENTS.md](../AGENTS.md)「## 撰写文档」为权威**，本文件只补充：信息架构映射、进度、各范式配方、机制坑点、已建资产、验证方法。完成全部批次后可删除本文件。

## 任务目标

把 `docs/content/docs/` 下约 66 页组件/函数文档从占位（`::callout{color="warning"}`）补全为正式文档，对齐 movk / Nuxt UI 结构。文档站基于 `@movk/nuxt-docs` + Nuxt Content。

## 三种页面范式

1. **组件页**：`## 简介 → ## 用法（基础示例）→ ## 示例（### 场景子节，可选）→ ## API（`:component-props/-emits/-slots{slug}`）→ ## Changelog`。
   - API 表由 `vue-component-meta` 从**本地 `src/runtime/components/**/*.vue` 源码 JSDoc 自动抽取**（改源码 JSDoc 即刷新表，勿手写）。slug = 带前缀注册名（如 `MapboxMarker`）。46 个组件均已被 component-meta 纳入。
   - `defineExpose` 暴露的实例**不被抽取**，需手写 `### Expose` 表（格式见已完成的 marker/popup/tooltip/video 页）。
2. **函数页**（composables / utils）：`## 简介 → ## 用法 → ## 示例（###，可选）→ ## API（### `useXxx()` / `fn()` 签名 + 手写「参数 / 返回值」表）→ ## Changelog`。component-meta **不覆盖**，API 全手写（范式参考 movk-nuxt-docs 的 useCategory 页）。
3. **承载页**（layers 的 type 页：circle/fill/line/symbol/fill-extrusion/heatmap）：文档对象是 `MapboxLayer` 的某 `type`，故 slug=`MapboxLayer`、标题用小写类型名、加 `::note{to="/docs/core/layer"}` 指明承载、API 仅列 Props。

## Changelog 配置规则（关键）

`:commit-changelog` 路径 = `commitPath`(app.config = `src/runtime`) + `prefix/` + Name + `.suffix`。**prefix 随组件子目录、name 用裸文件名**：

| 组件子目录 | 写法 |
| ---- | ---- |
| `components/`（根） | `:commit-changelog{prefix="components"}`（name 自动取路由→PascalCase） |
| 承载页（type） | `:commit-changelog{prefix="components" name="Layer"}` |
| `components/layers/` | `:commit-changelog{prefix="components/layers" name="ClusterLayer"}` |
| `components/effects/` | `:commit-changelog{prefix="components/effects" name="Radar"}` |
| `components/environment/` | `:commit-changelog{prefix="components/environment" name="Fog"}` |
| `components/controls/` | `:commit-changelog{prefix="components/controls" name="NavigationControl"}` |
| `components/extensions/` | `:commit-changelog{prefix="components/extensions" name="DrawControl"}` |
| `components/buffers/` | `:commit-changelog{prefix="components/buffers" name="BufferCircle"}` |
| composables | `:commit-changelog{prefix="composables" suffix="ts"}`（name 自动 useXxx） |
| utils | `:commit-changelog{prefix="utils" suffix="ts"}` |

## 示例约定（见 AGENTS.md，要点重述）

- 自包含内联：`docs/app/components/content/examples/` 下**拍平、文件名全局唯一**；直接写 `<MapboxMap class="h-115" :options>`，**禁用 DemoMap**；容器用 `h-115`（≈460px），不用内联 style；token 已由模块注入，无需兜底 UI。
- 底图：mapbox style（`mapbox://styles/mapbox/light-v11` 等）或叠 `MapboxTiandituLayer`（天地图，extensions 域用）。
- `::component-example` 一律 `prettier: true`；源码偏长加 `collapse: true`；交互参数用 `options`（label 英文，颜色项 name 以 `color` 结尾自动渲染色块）。
- 依赖 `setInterval`/RAF/lottie 的示例（effects 域、LottieMarker）加 `clientOnly: true`。
- `::component-code` 无法渲染需 `<MapboxMap>` 父级的组件，一律用 `::component-example`（自包含 .vue）。

## 侧栏分类机制

页面 `category` frontmatter + [docs/app/composables/useCategory.ts](app/composables/useCategory.ts) 注册（按 section slug）实现分组，**URL 不变**。**section 内所有页都要带 category**，否则未归类页落入英文 "Overview" 组，割裂侧栏。

## 进度

### 已完成
- **AGENTS.md「撰写文档」**：规范已固化。
- **useCategory.ts**：已注册 `core`（basics/organization/overlay）、`layers` 追加 `buffers`；`getting-started`/`layers`(builtin,data-driven)/`effects`/`extensions`/`utils` 为既有。
- **core 域 9 页全完成**：map/source/layer（layer 为定型基准）、layer-group/custom-layer/marker/lottie-marker/popup/tooltip。
- **layers 域 16 页全完成**：type 5（fill/line/symbol/fill-extrusion/heatmap）、dedicated 5（cluster/building/image/video/raster）、buffer 5（buffer-circle/ellipse/line/polygon/sector，新建页 + buffers 分类）。
- **2 处缺陷修复**：LayerFilterExample 的 circle-color 改用 `match`；Map.vue persistent JSDoc 的裸 `<KeepAlive>` 改为内联代码。

### 待完成批次（按序）
- **B-controls**（5 页）：navigation/geolocate/fullscreen/scale/attribution。需在 useCategory 加 `controls` 键，建议两组：交互控件（navigation/geolocate/fullscreen）、信息控件（scale/attribution），并给 5 页补 category。组件在 `components/controls/`。
- **B-extensions**（7 页）：组件页 draw(MapboxDrawControl)/tianditu/wms/wmts（`components/extensions/`）；函数页 draw-modes(`movkDrawModes`)/draw-theme(`drawThemeStyles`)/coordinate（util）。category（draw/basemap/coordinate）与页面 frontmatter **已存在**。天地图/坐标示例用天地图底图。先做 1 个函数页 PoC 定型。
- **B-environment**（6 页）：fog/lights/terrain/temperature/rain/snow（`components/environment/`）。需在 useCategory 加 `environment` 键，建议两组：场景氛围（fog/lights/terrain）、天气与温度（rain/snow/temperature），并补 category。rain/snow 为实验性 API，用 `::note{color="warning"}` 标注。
- **B-effects**（12 页）：radar/diffusion/glow/wave/trail/migration/flow-building/gradient-building/texture-building/window-building/sprite-image/animated-image（`components/effects/`）。category（dynamic/building/annotation）与页面 frontmatter **已存在**。示例普遍需 `clientOnly`。
- **B-composables**（11 页，函数页范式）：use-map/use-mapbox/use-mapbox-camera/use-mapbox-draw/use-mapbox-image/use-feature-state/use-frame-icon/use-map-animation/use-map-export/use-measure/define-mapbox-control。需在 useCategory 加 `composables` 键（四组：context=useMap/useMapbox/defineMapboxControl；camera-anim=useMapboxCamera/useMapAnimation；interaction=useFeatureState/useMeasure/useMapboxDraw；icon-export=useMapboxImage/useFrameIcon/useMapExport），并补 category。**先做 1 页 PoC 定函数页模板。**
- **B-utils**（5 页，函数页范式）：coordinate(transformPoint/transformGeoJSON)/buffer(bufferPaints)/geometry(boundsOfGeoJSON)/measure(formatDistance/formatArea)/heatmap(heatmapPaint)。category（geometry/coordinate/misc）与 frontmatter **已存在**。

## 机制坑点（避免重复踩）

- **circle-color 等颜色属性**：用 `['match', ['get','prop'], v1,'#color1', ...,'#fallback']` 或 `interpolate`；**勿用 `['at', i, ['literal', [...colors]]]`**（返回 string 而非 color，addLayer 抛错致整层不渲染）。
- **源码 JSDoc 勿含裸尖括号标签**（如 `<KeepAlive>`），会被 MDC 当组件解析报警告；用内联代码 `` `<keep-alive>` ``。
- 改运行时源码 JSDoc 后跑 `pnpm dev:prepare` 或重启 docs 让 component-meta 重新抽取。
- buffer 组件无 emits/slots/expose（仅 Props）；cluster 有 emits（clusterClick/pointClick）；video 有 expose（play/pause/video）。
- 新建页文件名前缀编号要接续该 section（如 buffer 页用 12–16）。
- 外部资源示例（image=mapbox radar.gif、video=mapbox drone.mp4、raster=OSM 瓦片）依赖网络，渲染需浏览器确认。

## 已建示例清单（`docs/app/components/content/examples/`，勿重复创建）

core/layers 共 28 个：MapBasicExample、MapCameraExample、SourceGeojsonExample、SourceUpdateExample、LayerBasicExample、LayerInteractionExample、LayerFilterExample、LayerCircleExample、LayerCircleDataExample、LayerGroupExample、CustomLayerExample、MarkerBasicExample、MarkerDraggableExample、LottieMarkerExample、PopupBasicExample、PopupClickExample、TooltipExample、LayerFillExample、LayerLineExample、LayerSymbolExample、LayerFillExtrusionExample、LayerHeatmapExample、ClusterLayerExample、BuildingLayerExample、ImageLayerExample、VideoLayerExample、RasterLayerExample、BufferCircleExample、BufferEllipseExample、BufferLineExample、BufferPolygonExample、BufferSectorExample。

## 验证流程（每批次后）

```bash
pnpm lint                       # 必须通过
pnpm run docs                   # 后台启动；注意先 pkill 旧实例避免端口占用
# 轮询 http://localhost:3000/docs/<section>/<page> 取 200，抽查：
#  - 章节顺序、示例组件挂载（curl HTML grep 组件名）
#  - 侧栏分类分组出现、无英文 "Overview" 误置、无 warning 占位残留
#  - 日志无 error / "is not registered" / "Failed to resolve" / addLayer 报错
pkill -f "nuxt dev"; pkill -f nitro    # 收尾清理
# 若改了 src/runtime 源码 JSDoc：pnpm typecheck（注释改动应无新增报错；
#   注意仓库存在与本任务无关的预存 typecheck 报错：node_modules/@movk/nuxt-docs/* 与 src/module.ts:46）
```

提交遵循 `AGENTS.md` 与 Conventional Commits（中文描述）。
