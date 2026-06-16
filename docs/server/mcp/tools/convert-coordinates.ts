import { z } from 'zod'
import gcoord from 'gcoord'

const CRS_MAP = {
  WGS84: gcoord.WGS84,
  GCJ02: gcoord.GCJ02,
  BD09: gcoord.BD09
} as const

const crsEnum = z.enum(['WGS84', 'GCJ02', 'BD09'])
const point = z.tuple([z.number(), z.number()])

export default defineMcpTool({
  description: 'Convert coordinates between WGS84 (GPS), GCJ02 (Mars / Amap) and BD09 (Baidu) using gcoord. Accepts a single [lng, lat] point or an array of points. Useful when overlaying Chinese basemaps where datum offset matters.',
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    coordinates: z.union([point, z.array(point)]).describe('A single [lng, lat] point or an array of [lng, lat] points'),
    from: crsEnum.describe('Source coordinate reference system'),
    to: crsEnum.describe('Target coordinate reference system')
  },
  inputExamples: [
    { coordinates: [116.397, 39.908], from: 'WGS84', to: 'GCJ02' },
    { coordinates: [[116.397, 39.908], [121.473, 31.230]], from: 'WGS84', to: 'BD09' }
  ],
  async handler({ coordinates, from, to }) {
    const convert = (pt: [number, number]): [number, number] =>
      gcoord.transform(pt, CRS_MAP[from], CRS_MAP[to]) as [number, number]

    const isSingle = typeof coordinates[0] === 'number'
    const output = isSingle
      ? convert(coordinates as [number, number])
      : (coordinates as [number, number][]).map(convert)

    return { from, to, input: coordinates, output }
  }
})
