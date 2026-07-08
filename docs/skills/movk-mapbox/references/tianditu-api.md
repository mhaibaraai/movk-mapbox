# 天地图 WEB 服务 API 参考资料

> 来源为天地图官网 WEB 服务 API 文档（`lbs.tianditu.gov.cn/server/*`、`lbs.tianditu.gov.cn/staticapi/*`），共 7 个接口：地名搜索 V2.0、公交规划、地理编码查询、逆地理编码查询、行政区划 V2.0、驾车规划、静态地图 API。所有接口均为 HTTP/HTTPS GET 接口，均需在控制台申请 `tk`（密钥），随请求以 `tk=您的密钥` 传递。
>
> 本包 [utils/tianditu-search.ts](../../../../src/runtime/utils/tianditu-search.ts)、[utils/tianditu-route.ts](../../../../src/runtime/utils/tianditu-route.ts)、[utils/tianditu-administrative.ts](../../../../src/runtime/utils/tianditu-administrative.ts) 已封装地名搜索、驾车路线规划、行政区划查询；官方文档本身对部分接口（尤其驾车规划的 XML 返回）字段说明缺失或过时，本资料是补充核实后的完整版本，新增/调整这些封装时以此为准，不要凭记忆假设字段名。
>
> **坐标系**：天地图各接口的经纬度均为 WGS84（CGCS2000），**不是**高德/腾讯那种加密的 GCJ02（火星坐标）。天地图坐标不需要、也不应该再经过 GCJ02→WGS84 转换——这会凭空引入 50m~1km 量级的偏移。曾经错误地对本包全部四个封装做过这层转换，导致 Mapbox（WGS84）地图上点位明显偏移，已修复；新增封装时不要重新引入该转换。

## 目录

1. [地名搜索 V2.0](#1-地名搜索-v20)
2. [公交规划](#2-公交规划)
3. [地理编码查询（地址转坐标）](#3-地理编码查询地址转坐标)
4. [逆地理编码查询（坐标转地址）](#4-逆地理编码查询坐标转地址)
5. [行政区划 V2.0](#5-行政区划-v20)
6. [驾车规划](#6-驾车规划)
7. [静态地图 API](#7-静态地图-api)

---

## 1. 地名搜索 V2.0

**文档地址**：<http://lbs.tianditu.gov.cn/server/search2.html>
**服务地址**：`http://api.tianditu.gov.cn/v2/search`
**简介**：地名搜索服务 V2.0 提供 7 种搜索能力：普通搜索、视野内搜索、周边搜索、多边形搜索、行政区域搜索、分类搜索、统计搜索。请求格式统一为：

```text
http://api.tianditu.gov.cn/v2/search?postStr={JSON}&type=query&tk=您的密钥
```

`postStr` 为 JSON 字符串，公共参数：`keyWord`（关键字，必填，除行政区域搜索/分类搜索外）、`queryType`（服务类型，决定走哪种搜索）、`start`（分页起始位，0-300）、`count`（返回条数，1-300）、`dataTypes`（POI 分类，可选，多个用英文逗号分隔）、`show`（1=基本 POI 信息，2=详细 POI 信息，可选）。

### 1.1 七种 `queryType` 及各自特有参数

| queryType | 服务 | 特有必填参数 |
| --- | --- | --- |
| 1 | 普通搜索（含地铁公交）；7 为地名搜索 | `mapBound`（查询范围 minx,miny,maxx,maxy）、`level`（1-18 级）、`specify`（可选，行政区国标码，若指定省级以上返回统计数据） |
| 2 | 视野内搜索 | `mapBound`、`level` |
| 3 | 周边搜索 | `pointLonlat`（中心点经纬度）、`queryRadius`（半径，米，10 公里内） |
| 10 | 多边形搜索 | `polygon`（经纬度坐标对拼接，首尾坐标须相同，如 `x1,y1,x2,y2,...,x1,y1`） |
| 12 | 行政区划区域搜索 | `specify`（必填，行政区国标码） |
| 13 | 数据分类搜索 | `specify`（必填）、`mapBound`（必填） |
| 14 | 统计搜索 | `specify`（必填） |

### 1.2 返回参数说明

顶层：`resultType`（1-5，决定返回体结构）、`count`（返回总条数）、`keyword`（回显搜索词）、`status`（`infocode`+`cndesc`，见 1.4 状态码表）。按 `resultType` 分流：

- **1（普通 POI）** → `pois: Poi[]`，每个 Poi 含：`name`、`phone`、`address`、`eaddress`（英文地址）、`ename`（英文名）、`lonlat`（"x,y" 字符串）、`poiType`（101=POI 数据，102=公交站点）、`hotPointID`、`province`/`provinceCode`/`city`/`cityCode`/`county`/`countyCode`、`source`（数据来源）、`typeCode`/`typeName`（分类编码/名称）、`distance`（仅周边搜索返回，1km 以下单位 m，以上单位 km）；当 `poiType=102` 时额外返回 `stationData: { lineName, uuid, stationUuid }[]`（车站线路信息）。
- **2（统计）** → `statistics`：`count`（POI 总数）、`adminCount`（行政区数量）、`priorityCitys`（推荐行政区数组，含 `name`/`count`/`lonlat`/`ename`/`adminCode`）、`allAdmins`（各省包含信息，含 `isleaf` 标记是否有下级行政区）。
- **3（行政区）** → `area`：`name`、`bound`（定位范围 "minx,miny,maxx,maxy"）、`lonlat`（中心点）、`adminCode`、`level`（显示级别 1-18）。
- **4（建议词搜索）** → `prompt`：提示类型 `type`（1=是否在 X 搜 Y、2=在 X 无 Y 结果、3=多个可跳转行政区、4=城市）+ `admins`（`adminName`/`adminCode`）+ `keyword`。
- **5（线路结果）** → `lineData`：`stationNum`（站数量）、`poiType`（固定 103）、`name`（线路名）、`uuid`（线路 id）。

> 注意：数据分类搜索（queryType=13）传**多个** `dataTypes`（逗号分隔）时，响应不是上述扁平结构，而是**按分类名分 key 的对象**：`{ "法院": { resultType, count, pois }, "公园": { resultType, count, pois } }`，无顶层 `resultType`/`status`。传单个 `dataTypes` 时仍为扁平结构。封装层据此分派：扁平走 `resultType` 归一化，分组对象归一化为 `kind: 'categories'`。任一分类非法会导致整个请求 HTTP 400（不会走到分组分支）。

### 1.3 请求示例

```text
行政区划区域：http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"商厦","queryType":12,"start":0,"count":10,"specify":"156110108"}&type=query&tk=您的密钥
视野内搜索：http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"医院","level":12,"mapBound":"116.02524,39.83833,116.65592,39.99185","queryType":2,"start":0,"count":10}&type=query&tk=您的密钥
周边搜索：http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"公园","level":12,"queryRadius":5000,"pointLonlat":"116.48016,39.93136","queryType":3,"start":0,"count":10}&type=query&tk=您的密钥
普通搜索：http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"北京大学","level":12,"mapBound":"116.02524,39.83833,116.65592,39.99185","queryType":1,"start":0,"count":10}&type=query&tk=您的密钥
统计搜索：http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"学校","queryType":14,"specify":"156110108"}&type=query&tk=您的密钥
数据分类：http://api.tianditu.gov.cn/v2/search?postStr={"queryType":13,"start":0,"count":5,"specify":"156110000","dataTypes":"法院,公园"}&type=query&tk=您的密钥
```

### 1.4 返回信息码

| 返回码 | 英文描述 | 定义 | 常见原因 |
| --- | --- | --- | --- |
| 1000 | OK | 服务正常 | 服务请求正常 |
| 2001 | Parameter Invalid | 请求参数错误 | 请求参数拼写错误 |
| 2002 | Parameter formal error | 请求参数格式错误 | 请求参数不符合 Json 标准 |
| 2003 | Parameter missing | 缺少必填参数 | 缺少接口要求的必填参数 |
| 2004 | Parameter wrong value | 枚举值错误 | 参数枚举值错误 |
| 2005 | Parameter wrong latlon | 经纬度数据错误 | 传入的经纬度数据错误 |
| 2006 | Parameter latlon slop over | 经纬度越界 | 传入的经纬度数据量超过 20 个点 |
| 2007 | Parameter count slop over | 请求数据量溢出 | `start`/`count` 问题，或总数据超过 500 条 |
| 3000 | Server error | 服务器出错 | 后台服务器异常 |
| 3001 | No data found | 没有找到数据 | 未找到任何结果 |

---

## 2. 公交规划

**文档地址**：<http://lbs.tianditu.gov.cn/server/bus.html>
**服务地址**：`http://api.tianditu.gov.cn/transit`
**简介**：根据起点、终点坐标查询公交/地铁换乘规划线路；同一接口（`type=busline`）还支持按线路 `uuid` 查详细信息、按 `lineUuid`+`stationUuid` 查该站在该线路上的信息。本包暂未封装此接口。

### 2.1 换乘规划请求参数

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| `startPosition` | 出发点坐标 "经度,纬度" | String |
| `endPosition` | 终点坐标 "经度,纬度" | String |
| `lineType` | 按位判断规划类型（可同时组合获取多种）：第 0 位=1 较快捷；第 1 位=1 少换乘；第 2 位=1 少步行；第 3 位=1 不坐地铁 | String |

请求：`http://api.tianditu.gov.cn/transit?type=busline&postStr={"startposition":"116.427562,39.939677","endposition":"116.349329,39.939132","linetype":"1"}&tk=您的密钥`

### 2.2 换乘规划返回结构

顶层：`resultCode`（0-6，见下表）、`hasSubway`（0/1，返回线路中是否含地铁）、`results: typeResult[]`（请求几种类型即返回几种）。

- **resultCode**：0=正常返回线路；1=找不到起点；2=找不到终点；3=规划线路失败；4=起终点 200 米内不规划，建议步行；5=起终点 500 米内，返回线路；6=输入参数错误。
- **typeResult**：`lineType`（回显请求的类型位）、`lines: line[]`（最多 5 条，每条为一整套起点到终点的换乘方案）。
- **line**：`lineName`（如 "3路—4路—5路"）、`segments: segment[]`（换乘线路中的分段）。
- **segment**：`segmentType`（1-4，线路类型）、`stationStart`/`stationEnd`（station 结构：`name`/`uuid`/`lonlat`）、`segmentLine`（`segmentName` 不含括号的线路名、`direction` 完整线路名、`linePoint` 坐标串、`segmentDistance` 本段距离，若为步行且 <20 米则不返回、`segmentStationCount` 经过站数、`segmentTime` 耗时分钟）。

### 2.3 线路/站点详情查询（同一接口的另外两种用法）

- **按线路 uuid 查详情**：`http://api.tianditu.gov.cn/transit?type=busline&postStr={"uuid":"23212"}&tk=您的密钥`，返回 `lineinfo`：`lineName`、`lineType`（1=公交，2=地铁，3=磁悬浮）、`length`（米）、`station: Station[]`（`name`/`uuid`/`lonlat`）、`linePoint`（坐标串）、`startTime`/`endTime`（"hh:mm" 24 小时制）、`totalTime`（全程运营总时长/分钟）、`stationCount`、`interval`（发车间隔/秒）、`ticketcal`（0=单一票价，1=按距离，2=按站）、`totalPrice`/`startPrice`/`increasedPrice`/`increasedStep`（票价相关，单位分/千米/站）、`ismonTicket`（是否支持月票）、`isBidirectional`（是否双向）、`isManual`（是否人工售票）、`status`（0=使用中，1=非使用中）、`company`（所属公交公司）。
- **按线路+站点查详情**：`http://api.tianditu.gov.cn/transit?type=busline&postStr={"lineUuid":"21169","stationUuid":"128156"}&tk=您的密钥`，返回结构同上（含该线路完整 `station` 列表及 `linePoint`）。

---

## 3. 地理编码查询（地址转坐标）

**文档地址**：<http://lbs.tianditu.gov.cn/server/geocodinginterface.html>
**服务地址**：`http://api.tianditu.gov.cn/geocoder`
**简介**：将结构化地址（如"北京市海淀区莲花池西路28号"）解析为坐标点，仅限国内地址。

请求参数：`keyWord`（请求关键字，必填，String）。

请求示例：

```text
http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"北京市海淀区莲花池西路28号"}&tk=您的密钥
```

返回示例：

```json
{
  "msg": "ok",
  "location": {
    "score": 100,
    "level": "门址",
    "lon": "116.290158",
    "lat": "39.894696",
    "keyWord": "北京市海淀区莲花池西路28号"
  },
  "searchVersion": "6.4.9V",
  "status": "0"
}
```

返回字段：`status`（0=正常，101=结果为空，404=出错）、`msg`（OK 正常，其他异常）、`location`：`lon`/`lat`（Double，必返回）、`level`（类别名称，非必返回）、`typeRound`（附近相似点数组，仅开启周边查询时返回）。

---

## 4. 逆地理编码查询（坐标转地址）

**文档地址**：<http://lbs.tianditu.gov.cn/server/geocoding.html>
**服务地址**：`http://api.tianditu.gov.cn/geocoder`（与地理编码共用域名路径，通过 `type=geocode` 区分）

> 文档页参数表列出的是较早版本的 `lon`/`lat`/`appkey`/`ver` 四个必填参数，但页面给出的实际请求示例采用 `postStr` JSON + `type=geocode&tk=` 的调用方式（与地名搜索 V2.0 风格一致），**以实际示例为准**：

请求示例：

```text
http://api.tianditu.gov.cn/geocoder?postStr={'lon':116.37304,'lat':39.92594,'ver':1}&type=geocode&tk=您的密钥
```

返回示例：

```json
{
  "result": {
    "formatted_address": "北京市西城区西什库大街31号院23东方开元信息科技公司",
    "location": { "lon": 116.37304, "lat": 39.92594 },
    "addressComponent": {
      "address": "西什库大街31号院23",
      "city": "北京市西城区",
      "road": "大红罗厂街",
      "poi_position": "东北"
    }
  },
  "status": "0",
  "msg": "OK"
}
```

返回字段：`status`（0=正确，1=错误，404=出错）、`msg`（status=404 时返回错误信息）、`result`：

- `formatted_address`：详细地址（必返回）
- `location`：`lon`/`lat`（此点坐标）
- `addressComponent`：`address`（此点最近地点信息）、`address_distince`（距最近地点的距离）、`address_position`（相对最近地点的方向）、`city`（所在国家/城市/区县）、`poi`（最近 POI 点）、`poi_distince`/`poi_position`（距离/方向）、`road`（最近道路）、`road_distince`（距该路距离）

---

## 5. 行政区划 V2.0

**文档地址**：<http://lbs.tianditu.gov.cn/server/administrative2.html>
**服务地址**：`http://api.tianditu.gov.cn/v2/administrative`
**简介**：按行政区划名称或编码查询中心点、轮廓（边界）、所属上级/下级行政区划。另提供行政区划名称-编码对照表下载与可视化数据下载入口（页面内 JS 触发下载，未在文档正文给出直链）。

### 5.1 请求参数

| 参数名 | 必选 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- | --- |
| `keyword` | 是 | string | 只支持单个关键词，支持行政区划名称（仅名称支持模糊查询）或行政区划编码，如 `'北京'` 或 `'156110000'`；注：`keyword` 只有一个字符时只返回 `suggestion`，不返回 `district` | 无 |
| `childLevel` | 否 | string | 下级行政区级数：0=不返回下级，1=返回下一级，2=返回下两级，3=返回下三级（部分省直辖县市在省级下直接显示区县，如河南-济源） | 0 |
| `extensions` | 否 | boolean | 是否需要轮廓数据：true=返回，false=不返回 | false |

### 5.2 返回参数

顶层：`message`（返回描述）、`status`（200=正常，其他见描述）、`data`：`suggestion`（模糊匹配建议词数组，只匹配到一条时为空）、`district`（行政区划信息数组）。

- **district**：`name`（名称）、`gb`（行政区划编码）、`boundary`（轮廓数据，WKT 格式 `MULTIPOLYGON(((...)))`，仅 `extensions=true` 时返回）、`center: { lng, lat }`、`level`（国家级=5，省级=4，市级=3，区县级=2）、`children`（下级行政区划数组，结构同 district 但无 `boundary`）。

### 5.3 请求示例

```text
http://api.tianditu.gov.cn/v2/administrative?keyword=156110000&childLevel=0&extensions=true&tk=您的密钥
```

```json
{
  "status": 200,
  "message": "成功",
  "data": {
    "suggestion": [],
    "district": [
      {
        "gb": "156110000",
        "name": "北京市",
        "boundary": "MULTIPOLYGON(((116.666886 40.976711, ...)))",
        "center": { "lng": 116.718412, "lat": 39.903857 },
        "level": 4
      }
    ]
  }
}
```

---

## 6. 驾车规划

**文档地址**：<http://lbs.tianditu.gov.cn/server/drive.html>
**服务地址**：`http://api.tianditu.gov.cn/drive`
**简介**：根据起点、终点、途经点规划驾车/步行路线。

### 6.1 请求参数

| 参数 | 说明 | 类型 | 是否必填 | 备注 |
| --- | --- | --- | --- | --- |
| `orig` | 起点经纬度 "经度,纬度" | string | 是 | 范围 -180,-90 至 180,90 |
| `dest` | 终点经纬度 "经度,纬度" | string | 是 | 范围 -180,-90 至 180,90 |
| `mid` | 途经点经纬度字符串 | string | 否 | 多个途经点用 `;` 分隔，坐标 x,y 用 `,` 分隔，如 `116.35506,39.92277;116.36506,39.91277` |
| `style` | 导航路线类型 | string | 否，默认 0 | 0=最快路线，1=最短路线，2=避开高速，3=步行 |

### 6.2 请求示例

```text
无途经点：http://api.tianditu.gov.cn/drive?postStr={"orig":"116.35506,39.92277","dest":"116.39751,39.90854","style":"0"}&type=search&tk=您的密钥
含途经点：http://api.tianditu.gov.cn/drive?postStr={"orig":"116.35506,39.92277","dest":"116.39751,39.90854","mid":"116.36506,39.91277;116.37506,39.92077","style":"0"}&type=search&tk=您的密钥
```

### 6.3 返回格式

返回为 **XML**（而非其它接口通用的 JSON）：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<result orig='起点经纬度' mid='途径点信息' dest='终点经纬度'>
    <parameters>
        <orig>起点加密经纬度</orig>
        <dest>终点加密经纬度</dest>
        <mid>途径点加密经纬度集合</mid>
        <key>经纬度加密的 key 值</key>
        <width>地图宽度</width>
        <height>地图高度</height>
        <style>导航路线类型</style>
        <version>版本控制</version>
        <sort>排序方式</sort>
    </parameters>
    <routes count='分段总数' time='查询时间'>
        <item id='0'>
            <strguide>每段线路文字描述</strguide>
            <signage>“路牌”引导提示/高速路收费站出口信息</signage>
            <streetName>当前路段名称</streetName>
            <nextStreetName>下一段道路名称</nextStreetName>
            <tollStatus>道路收费信息(0=免费路段，1=收费路段，2=部分收费路段)</tollStatus>
            <turnlatlon>转折点经纬度</turnlatlon>
        </item>
        <!-- 其他分段线路信息，item id 依次递增 -->
    </routes>
    <simple>
        <item id='0'>
            <strguide>每段线路文字描述</strguide>
            <streetNames>当前行驶路段名称（含多个路段）</streetNames>
            <lastStreetName>最后一段道路名称</lastStreetName>
            <linkStreetName>合并段之间衔接的道路名称</linkStreetName>
            <signage>“路牌”引导提示/高速路收费站出口信息</signage>
            <tollStatus>道路收费信息(0=免费路段，1=收费路段，2=部分收费路段)</tollStatus>
            <turnlatlon>转折点经纬度</turnlatlon>
            <streetLatLon>线路经纬度</streetLatLon>
            <streetDistance>行驶总距离（单位：米）</streetDistance>
            <segmentNumber>合并后的号段，对应详细描述中的号段</segmentNumber>
        </item>
        <!-- 其他分段线路信息，item id 依次递增 -->
    </simple>
    <distance>全长（单位：公里）</distance>
    <duration>行驶总时间（单位：秒）</duration>
    <routelatlon>线路经纬度字符串</routelatlon>
    <mapinfo>
        <center>全部结果同时显示的适宜中心经纬度</center>
        <scale>全部结果同时显示的适宜缩放比例</scale>
    </mapinfo>
</result>
```

字段说明：

- `<parameters>`：请求参数的回显（多为加密态，非明文经纬度），除 6.1 已文档化的 `orig`/`dest`/`mid`/`style` 外，还回显了未在请求参数表中出现的 `key`（经纬度加密 key）、`width`/`height`（地图宽高）、`version`（版本号）、`sort`（排序方式）——这些可能是签名/加密相关的内部字段，非调用方需要主动传入的必填参数。
- `<routes>`：**逐路口的详细导航**，`count` 为分段总数、`time` 为查询耗时；每个 `<item>` 对应一个转折点/路口，含文字播报 `strguide`、路牌/收费站提示 `signage`、当前/下一段道路名 `streetName`/`nextStreetName`、收费状态 `tollStatus`、转折点坐标 `turnlatlon`。
- `<simple>`：**合并简化后的导航**（把连续同名道路的多个 `routes` 分段合并为一段），每个 `<item>` 额外含 `streetNames`（合并段内的多个路段名）、`lastStreetName`、`linkStreetName`（合并段间的衔接道路名）、`streetLatLon`（该合并段坐标）、`streetDistance`（该合并段距离，米）、`segmentNumber`（对应 `routes` 中的详细分段号，用于关联两者）。
- `<distance>`：全程距离，单位**公里**。
- `<duration>`：全程耗时，单位**秒**。
- `<routelatlon>`：全程路线坐标串，用于直接画线到地图上。
- `<mapinfo>`：`center`/`scale`，规划完成后适合展示整条路线的地图中心点与缩放级别，可直接喂给 `fitBounds`/`flyTo` 类相机工具。

> [utils/tianditu-route.ts](../../../../src/runtime/utils/tianditu-route.ts) 的 `planRoute()` 目前只用正则从这份 XML 里取 `routelatlon`（转坐标+转 WGS84）、`distance`、`duration`、`<simple>` 段内的 `strguide` 拼接摘要；`<routes>` 的逐路口细节（`signage`/`tollStatus`/`streetName` 等）尚未消费，如需更精细的转向播报可在此基础上扩展提取。

---

## 7. 静态地图 API

**文档地址**：<http://lbs.tianditu.gov.cn/staticapi/static.html>
**服务地址**：`http://api.tianditu.gov.cn/staticimage`
**简介**：以 HTTP 请求方式返回 PNG 格式地图图片，可通过 `<img src="...">` 直接嵌入网页；相比 JS API 动态加载更快，适合"生成一张地图截图"类场景。请求频率无限制，URL 长度上限 2048，点标记数量上限 26 个。本包暂未封装此接口。

### 7.1 请求参数

| 参数名 | 必选 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `width` | 否 | 400 | 图片宽度，取值范围 [1, 1024] |
| `height` | 否 | 300 | 图片高度，取值范围 [1, 1024] |
| `center` | 否 | `116.39127,39.90712` | 地图中心点坐标 "经度,纬度" |
| `zoom` | 否 | 10 | 地图缩放级别，取值范围 [3, 18] |
| `layers` | 否 | `vec_c,cva_c` | 叠加图层组合：`img_c`=影像图，`vec_c`=矢量底图，`ter_c`=地形图，`cva_c`=中文注记，`eva_c`=英文注记，`cta_c`=地形注记 |
| `markers` | 否 | null | 标注点，多个用 `\|` 分隔，如 `lng1,lat1\|lng2,lat2` |
| `markerStyles` | 否 | null | 与 `markers` 一一对应；同一点各字段用 `,` 分隔，不同点用 `\|` 分隔；字段为 `size,label,url[,sLabel,fontColor,fontSize]`：`size` 取 `l`（大图标）/`m`（中图标）/`s`（小图标）/`-1`（自定义图标）；`size=l/m` 时 `label` 为图标标签（`[0-9]`/`[A-Z]`）；`size=-1` 时后跟自定义图标 `url`、`sLabel`（自定义标签，需 URI 编码中文）、`fontColor`（16 进制色码，如 `0xff0000`）、`fontSize` |
| `paths` | 否 | null | 折线，经纬度描述；多条折线用 `\|` 分隔，每条内部的点用 `;` 分隔，坐标 x,y 用 `,` 分隔 |
| `pathStyles` | 否 | null | 折线样式 `color,weight,opacity[,fillColor]`：`color`（16 进制颜色，默认 `0xff0000`）、`weight`（线宽 1-40，默认 6）、`opacity`（透明度 0-1，默认 0.6）、`fillColor`（可选，指定则自动闭合为面并填充） |
| `pixLocation` | 否 | null | 将指定的经纬度坐标转换为相对于静态图左上角 (0,0) 的屏幕坐标，返回值为 `\|` 分隔的坐标对字符串；设置此参数时 `markers`/`markerStyles`/`paths`/`pathStyles` 均不生效，格式为 `lng0,lat0\|lng1,lat1\|...` |

### 7.2 请求示例

```text
基础底图：http://api.tianditu.gov.cn/staticimage?center=116.40,39.93&width=400&height=300&zoom=10&tk=您的密钥
指定图层：http://api.tianditu.gov.cn/staticimage?center=116.40,39.93&width=400&height=300&zoom=10&layers=vec_c,eva_c&tk=您的密钥
默认图标标注：http://api.tianditu.gov.cn/staticimage?center=116.40,39.93&width=500&height=500&zoom=12&layers=vec_c,cva_c&markers=116.34867,39.94593|116.42626,39.94731&tk=您的密钥
大图标+字母标签：...&markers=...&markerStyles=l,A|l,B&tk=您的密钥
自定义图标：...&markerStyles=-1,http://example.com/icon.png&tk=您的密钥
折线：...&paths=116.34867,39.94593;116.42626,39.94731;116.4551,39.90267&tk=您的密钥
自定义折线样式：...&pathStyles=0xff0000,8,0.7|0x00ff00,19,1&tk=您的密钥
封闭面+填充色：...&pathStyles=0x0000ff,5,0.6,0x0000f0&tk=您的密钥（首尾坐标相同的 paths 会自动按 fillColor 填充为面）
获取屏幕坐标：...&pixLocation=116.34867,39.94593|116.42626,39.94731&tk=您的密钥 → 返回如 "101,204||327,200"
```

响应说明：返回值为 PNG 图片二进制流（非 JSON），失败时无标准错误 JSON（依赖 HTTP 状态码 + URL 参数校验）。
