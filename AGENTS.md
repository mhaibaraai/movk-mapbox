# AGENTS.md

面向 AI 代理与贡献者的协作约定。本文聚焦 props / 选项接口的 JSDoc 规范；通用代码风格仍以仓库现有约定与 ESLint/Prettier 为准。

## Props / 选项接口 JSDoc 规范

适用范围：组件 `defineProps`、composables 选项接口（`UseXxxOptions`）、`utils` / `draw-modes` 的选项接口、`types` 中的公共选项类型。同一文件内被 props 透传的嵌套接口同样适用。

### 默认值用 @defaultValue，不要写进描述

默认值用独立的 `@defaultValue` 标签表达，描述文本只描述语义，不再内嵌「默认 X」。

```ts
// 推荐
/**
 * 主色
 * @defaultValue '#f43f5e'
 */
color?: string

// 避免
/** 主色，默认 #f43f5e */
color?: string
```

取值格式：

- 字符串 / 颜色：带引号 —— `'#f43f5e'`、`'image/png'`、`'EPSG:3857'`、`''`
- 数字：裸值 —— `50`、`3000`、`0.25`
- 布尔：裸值 —— `true`、`false`
- 数组 / 对象 / 模板字面量等复杂值：反引号包裹 —— `` `[0, 40]` ``、`` `wms-${layers}` ``

### 单行与多行的取舍

- 纯描述、无任何标签：保持单行 `/** 描述 */`
- 含 `@defaultValue` 或 `@see`：展开为多行块注释

### 取值必须来自真实默认，不能照抄旧描述

`@defaultValue` 要反映运行时真实默认值，逐个核对来源：

1. 组件 `withDefaults` 第二参数
2. 代码层默认：下游 util / computed 里的 `options.x ?? 默认值`、解构默认 `{ x = 默认值 }`，或 Mapbox 规范自身的默认

描述里写的默认值可能与代码不一致，以代码为准。例如某 prop 描述写「默认 0.9」，但实际透传到 util 后取 `?? 0.85`，则 `@defaultValue` 应为 `0.85`。

没有单一字面量的默认（如「缺省为蓝→红五档」「缺省等于 frames」）不强行造 `@defaultValue`，改写为描述：`缺省为 ...` / `省略时 ...`。

### 官方可信任类型补 @see

当 prop / 字段的类型是「整体透传的官方选项 / 规范对象」时，补一条 `@see` 指向官方文档，与 `@defaultValue` 并列：

```ts
/**
 * 大气/雾效果选项；缺省 {} 使用样式默认大气
 * @see https://docs.mapbox.com/style-spec/reference/fog
 */
options?: FogSpecification
```

适用：`MarkerOptions`、`PopupOptions`、各控件构造选项、`MapOptions`、`SourceSpecification`、`CustomLayerInterface`、`FogSpecification` / `SnowSpecification` / `RainSpecification` / `LightsSpecification` 等。

不适用：仅按索引派生的单字段或联合类型（如 `GeoJSONSourceSpecification['data']`、`string | SourceSpecification`），避免噪声。

URL 必须经官方文档核对，不能凭记忆杜撰。常用根：

- Style Spec：`https://docs.mapbox.com/style-spec/reference/<name>`（fog、rain、snow、light、terrain、sources）
- GL JS API：`https://docs.mapbox.com/mapbox-gl-js/api/<page>/`，类锚点小写（如 `api/markers/#popup`、`api/map/`、`api/properties/#customlayerinterface`）

补 `@see` 时若该 prop 尚无描述，一并补一句简短中文描述，使注释完整。

### 中文标点

描述用全角中文标点：`，。：；（）`。代码标识符、数字、单位、`@defaultValue` 取值、URL 保持半角。

区分默认值声明与普通行文里的「默认 / 缺省」——后者（如「使用默认 CDN」「缺省插入锚点」「element 由默认插槽提供」）是正常描述，保持原样，不转 `@defaultValue`。

### 完整示例

```ts
/**
 * 权重属性取值范围 [min, max]，线性映射到 0..1 热力权重
 * @defaultValue `[0, 40]`
 */
weightRange?: [number, number]

/**
 * Popup 选项（closeButton/closeOnClick 由组件接管）
 * @see https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
 */
options?: PopupOptions
```
