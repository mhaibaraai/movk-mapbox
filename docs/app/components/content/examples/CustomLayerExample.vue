<script setup lang="ts">
import { MercatorCoordinate } from 'mapbox-gl'
import type { CustomLayerInterface } from 'mapbox-gl'

// 经纬度转墨卡托裁剪坐标
const points = [[116.0, 40.2], [116.8, 40.2], [116.4, 39.6]].map(([lng, lat]) =>
  MercatorCoordinate.fromLngLat([lng!, lat!])
)

let program: WebGLProgram | null = null
let buffer: WebGLBuffer | null = null
let aPos = 0

// CustomLayerInterface：直接用 WebGL 在地图坐标系绘制一个三角形
const layer: CustomLayerInterface = {
  id: 'custom-triangle',
  type: 'custom',
  onAdd(_map, gl) {
    const vertex = `
      uniform mat4 u_matrix;
      attribute vec2 a_pos;
      void main() { gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0); }`
    const fragment = `
      void main() { gl_FragColor = vec4(0.894, 0.247, 0.341, 0.7); }`

    const vs = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vs, vertex)
    gl.compileShader(vs)
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fs, fragment)
    gl.compileShader(fs)

    program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    aPos = gl.getAttribLocation(program, 'a_pos')

    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(points.flatMap(p => [p.x, p.y])),
      gl.STATIC_DRAW
    )
  },
  render(gl, matrix) {
    if (!program) return
    gl.useProgram(program)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3)
  }
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.9], zoom: 8 }">
      <MapboxCustomLayer :layer="layer" />
    </MapboxMap>
  </div>
</template>
