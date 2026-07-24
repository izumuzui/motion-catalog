import * as THREE from 'three'

/* One renderer, many scenes.
   Each visible .three-stage receives a scissored viewport on this
   shared canvas, avoiding the browser's WebGL context limit. */

const canvas = document.createElement('canvas')
canvas.className = 'three-shared-canvas'
canvas.setAttribute('aria-hidden', 'true')
document.body.prepend(canvas)

let renderer = null
let entries = []
let frameId = 0
let playbackRate = 1
let allowMotion = !matchMedia('(prefers-reduced-motion: reduce)').matches

try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearAlpha(0)
  window.__threeCatalogReady = true
} catch {
  window.__threeCatalogReady = false
}

function oklchTokenToHex(tokenName) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim()
  const match = value.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i)
  if (!match) throw new Error(`Invalid WebGL color token: ${tokenName}`)

  const lightness = Number(match[1]) / (value.includes('%') ? 100 : 1)
  const chroma = Number(match[2])
  const hue = Number(match[3]) * Math.PI / 180
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)

  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b
  const l = lRoot ** 3
  const m = mRoot ** 3
  const s = sRoot ** 3

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  const srgb = linear.map(channel => {
    const clamped = Math.max(0, Math.min(1, channel))
    const encoded = clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * clamped ** (1 / 2.4) - 0.055
    return Math.round(encoded * 255)
  })
  return (srgb[0] << 16) | (srgb[1] << 8) | srgb[2]
}

function readPalette() {
  return {
    cobalt: oklchTokenToHex('--color-webgl-cobalt'),
    cyan: oklchTokenToHex('--color-webgl-cyan'),
    violet: oklchTokenToHex('--color-webgl-violet'),
    warm: oklchTokenToHex('--color-webgl-warm'),
    hot: oklchTokenToHex('--color-webgl-hot'),
    mint: oklchTokenToHex('--color-webgl-mint'),
    paper: oklchTokenToHex('--color-webgl-paper'),
    graphite: oklchTokenToHex('--color-webgl-graphite'),
    muted: oklchTokenToHex('--color-webgl-muted'),
    shadow: oklchTokenToHex('--color-webgl-shadow'),
  }
}

let COLORS = readPalette()

const clamp = THREE.MathUtils.clamp
const lerp = THREE.MathUtils.lerp
const smooth = value => value * value * (3 - 2 * value)
const wave01 = value => Math.sin(value) * 0.5 + 0.5

function standardMaterial(color = COLORS.cobalt, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.32,
    metalness: 0.12,
    ...options,
  })
}

function basicMaterial(color = COLORS.cobalt, options = {}) {
  return new THREE.MeshBasicMaterial({ color, ...options })
}

function addMesh(parent, geometry, material, position = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  parent.add(mesh)
  return mesh
}

function addLine(parent, points, color = COLORS.paper) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 })
  )
  parent.add(line)
  return line
}

function pointsFrom(count, factory, options = {}) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const point = factory(index, count)
    positions[index * 3] = point[0]
    positions[index * 3 + 1] = point[1]
    positions[index * 3 + 2] = point[2]
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: options.color || COLORS.cyan,
    size: options.size || 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: options.opacity ?? 0.9,
    depthWrite: false,
  })
  return new THREE.Points(geometry, material)
}

function addReferenceObjects(parent, count = 7) {
  const group = new THREE.Group()
  const material = standardMaterial(COLORS.cobalt)
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2
    const item = addMesh(
      group,
      index % 2
        ? new THREE.OctahedronGeometry(0.32)
        : new THREE.BoxGeometry(0.5, 0.5, 0.5),
      material.clone(),
      [Math.cos(angle) * 1.45, Math.sin(index * 1.7) * 0.45, Math.sin(angle) * 1.1]
    )
    item.rotation.set(angle * 0.4, angle, angle * 0.15)
  }
  parent.add(group)
  return group
}

function addFloor(parent, y = -1.25) {
  const floor = addMesh(
    parent,
    new THREE.CircleGeometry(2.4, 48),
    new THREE.MeshBasicMaterial({
      color: COLORS.graphite,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    }),
    [0, y, 0]
  )
  floor.rotation.x = -Math.PI / 2
  return floor
}

function buildTransform(key, content) {
  if (key === 'rotate-y') {
    const object = addMesh(
      content,
      new THREE.TorusKnotGeometry(0.75, 0.24, 96, 14),
      standardMaterial()
    )
    return time => {
      object.rotation.y = time * 1.35
      object.rotation.x = 0.3
    }
  }

  if (key === 'multi-axis-spin') {
    const object = addMesh(
      content,
      new THREE.IcosahedronGeometry(1, 1),
      standardMaterial(COLORS.violet, { flatShading: true })
    )
    return time => object.rotation.set(time * 0.7, time * 1.05, time * 0.4)
  }

  if (key === 'object-orbit') {
    addMesh(content, new THREE.DodecahedronGeometry(0.72), standardMaterial())
    const orbiters = new THREE.Group()
    for (let index = 0; index < 4; index += 1) {
      const pivot = new THREE.Group()
      pivot.rotation.x = index * 0.48
      const orbiter = addMesh(
        pivot,
        new THREE.SphereGeometry(0.13, 16, 12),
        basicMaterial(index % 2 ? COLORS.cyan : COLORS.warm),
        [1.45, 0, 0]
      )
      orbiter.userData.phase = index * 1.7
      orbiters.add(pivot)
    }
    content.add(orbiters)
    return time => {
      orbiters.children.forEach((pivot, index) => {
        pivot.rotation.y = time * (0.7 + index * 0.11) + index
      })
    }
  }

  if (key === 'spring-scale') {
    const object = addMesh(
      content,
      new THREE.DodecahedronGeometry(0.95, 0),
      standardMaterial(COLORS.cyan, { flatShading: true })
    )
    return time => {
      const local = time % 2.8
      const scale = 1 - Math.exp(-4.2 * local) * Math.cos(local * 10) * 0.65
      object.scale.setScalar(scale)
      object.rotation.y = time * 0.25
    }
  }

  if (key === 'squash-stretch') {
    const object = addMesh(
      content,
      new THREE.SphereGeometry(0.82, 32, 20),
      standardMaterial(COLORS.warm)
    )
    return time => {
      const bounce = Math.abs(Math.sin(time * 1.8))
      object.position.y = bounce * 0.9 - 0.35
      object.scale.set(1 + (1 - bounce) * 0.24, 0.78 + bounce * 0.34, 1 + (1 - bounce) * 0.24)
    }
  }

  if (key === 'float-bob') {
    const object = addMesh(
      content,
      new THREE.BoxGeometry(1.8, 1.05, 0.22, 2, 2, 1),
      standardMaterial(COLORS.cobalt)
    )
    const inset = addMesh(
      object,
      new THREE.BoxGeometry(1.24, 0.1, 0.03),
      basicMaterial(COLORS.paper),
      [0, 0.16, 0.13]
    )
    inset.rotation.z = 0
    return time => {
      object.position.y = Math.sin(time * 1.35) * 0.28
      object.rotation.set(-0.12 + Math.sin(time) * 0.08, Math.sin(time * 0.75) * 0.38, Math.sin(time) * 0.08)
    }
  }

  if (key === 'helix-rise') {
    const beads = new THREE.Group()
    for (let index = 0; index < 28; index += 1) {
      const phase = index / 28
      addMesh(
        beads,
        new THREE.SphereGeometry(0.075, 10, 8),
        basicMaterial(index % 3 ? COLORS.cyan : COLORS.warm),
        [
          Math.cos(phase * Math.PI * 5) * 0.85,
          phase * 2.6 - 1.3,
          Math.sin(phase * Math.PI * 5) * 0.85,
        ]
      )
    }
    content.add(beads)
    const traveler = addMesh(content, new THREE.OctahedronGeometry(0.25), standardMaterial(COLORS.paper))
    return time => {
      const phase = (time * 0.22) % 1
      traveler.position.set(
        Math.cos(phase * Math.PI * 5) * 0.85,
        phase * 2.6 - 1.3,
        Math.sin(phase * Math.PI * 5) * 0.85
      )
      beads.rotation.y = time * 0.22
    }
  }

  if (key === 'pendulum-swing') {
    const pivot = new THREE.Group()
    content.add(pivot)
    addLine(pivot, [new THREE.Vector3(0, 1.35, 0), new THREE.Vector3(0, -0.3, 0)])
    addMesh(pivot, new THREE.SphereGeometry(0.42, 24, 16), standardMaterial(COLORS.hot), [0, -0.68, 0])
    return time => {
      pivot.position.y = 0.2
      pivot.rotation.z = Math.sin(time * 1.7) * 0.62
    }
  }

  if (key === 'card-flip') {
    const card = new THREE.Group()
    content.add(card)
    addMesh(card, new THREE.BoxGeometry(1.9, 1.2, 0.12), standardMaterial(COLORS.cobalt))
    addMesh(card, new THREE.BoxGeometry(1.25, 0.12, 0.04), basicMaterial(COLORS.paper), [0, 0.18, 0.09])
    addMesh(card, new THREE.CircleGeometry(0.22, 24), basicMaterial(COLORS.warm), [-0.52, -0.26, -0.09]).rotation.y = Math.PI
    return time => {
      const phase = wave01(time * 1.4)
      card.rotation.y = smooth(phase) * Math.PI
      card.rotation.x = -0.08
    }
  }

  const parts = new THREE.Group()
  const bases = [
    [-0.5, 0.5, 0], [0.5, 0.5, 0], [-0.5, -0.5, 0], [0.5, -0.5, 0],
    [0, 0, 0.55], [0, 0, -0.55],
  ]
  bases.forEach((position, index) => {
    const part = addMesh(
      parts,
      new THREE.BoxGeometry(0.72, 0.72, 0.72),
      standardMaterial(index % 2 ? COLORS.cyan : COLORS.cobalt),
      position
    )
    part.userData.base = new THREE.Vector3(...position)
    part.userData.direction = part.userData.base.clone().normalize()
  })
  content.add(parts)
  return time => {
    const amount = smooth(wave01(time * 1.25))
    parts.children.forEach((part, index) => {
      part.position.copy(part.userData.base).addScaledVector(part.userData.direction, amount * 1.25)
      part.rotation.set(amount * (index + 1) * 0.18, amount * 0.7, 0)
    })
  }
}

function buildCamera(key, content, camera) {
  const reference = addReferenceObjects(content, key === 'layer-parallax' ? 10 : 7)
  const origin = new THREE.Vector3()

  if (key === 'camera-orbit') {
    return time => {
      camera.position.set(Math.cos(time * 0.55) * 4.6, 1.7, Math.sin(time * 0.55) * 4.6)
      camera.lookAt(origin)
    }
  }

  if (key === 'dolly-in') {
    return time => {
      camera.position.set(0, 0.7, 5.2 - wave01(time * 1.2) * 2.1)
      camera.lookAt(origin)
    }
  }

  if (key === 'truck-pan') {
    return time => {
      camera.position.set(Math.sin(time * 0.9) * 2.2, 0.8, 5)
      camera.lookAt(camera.position.x * 0.45, 0, 0)
    }
  }

  if (key === 'crane-rise') {
    return time => {
      const amount = wave01(time * 0.8)
      camera.position.set(0, 1 + amount * 3.2, 5 - amount * 0.7)
      camera.lookAt(0, 0, 0)
    }
  }

  if (key === 'camera-shake') {
    return time => {
      const local = time % 1.7
      const amplitude = Math.exp(-4 * local) * 0.16
      camera.position.set(
        Math.sin(local * 45) * amplitude,
        0.8 + Math.cos(local * 37) * amplitude,
        5
      )
      camera.lookAt(origin)
    }
  }

  reference.children.forEach((child, index) => {
    child.position.z = -index * 0.28 + 0.8
  })
  return time => {
    camera.position.set(Math.sin(time * 0.75) * 1.35, 0.75, 5)
    camera.lookAt(0, 0, 0)
  }
}

function buildLighting(key, scene, content) {
  const subject = addMesh(
    content,
    new THREE.TorusKnotGeometry(0.78, 0.26, 96, 14),
    standardMaterial(COLORS.muted, { roughness: 0.22, metalness: 0.55 })
  )
  const movingLight = new THREE.PointLight(COLORS.cobalt, 22, 8, 1.8)
  scene.add(movingLight)
  const bulb = addMesh(
    content,
    new THREE.SphereGeometry(0.09, 12, 8),
    basicMaterial(COLORS.cyan)
  )

  if (key === 'light-sweep') {
    return time => {
      const x = Math.sin(time * 1.1) * 3.2
      movingLight.position.set(x, 1.4, 2.5)
      bulb.position.copy(movingLight.position)
      subject.rotation.y = time * 0.28
    }
  }

  if (key === 'rim-light-pulse') {
    movingLight.color.set(COLORS.violet)
    return time => {
      const power = 8 + wave01(time * 1.9) * 28
      movingLight.intensity = power
      movingLight.position.set(-2.4, 1.5, -1.8)
      bulb.position.copy(movingLight.position)
      bulb.scale.setScalar(0.6 + power / 45)
      subject.rotation.y = time * 0.35
    }
  }

  if (key === 'point-light-orbit') {
    return time => {
      movingLight.position.set(Math.cos(time) * 2.6, 1.2, Math.sin(time) * 2.6)
      bulb.position.copy(movingLight.position)
      subject.rotation.y = -time * 0.22
    }
  }

  if (key === 'shadow-dance') {
    addFloor(content)
    const shadow = addMesh(
      content,
      new THREE.CircleGeometry(0.8, 32),
      new THREE.MeshBasicMaterial({
        color: COLORS.shadow,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      }),
      [0, -1.22, 0]
    )
    shadow.rotation.x = -Math.PI / 2
    return time => {
      movingLight.position.set(Math.cos(time) * 2.8, 2.4, Math.sin(time) * 2.8)
      bulb.position.copy(movingLight.position)
      shadow.scale.set(1 + Math.sin(time) * 0.45, 0.55, 1)
      shadow.rotation.z = time
      subject.rotation.y = time * 0.25
    }
  }

  return time => {
    const hue = 0.03 + wave01(time * 0.8) * 0.55
    movingLight.color.setHSL(hue, 0.78, 0.63)
    movingLight.position.set(2.2, 2, 2.5)
    bulb.material.color.copy(movingLight.color)
    bulb.position.copy(movingLight.position)
    subject.rotation.y = time * 0.3
  }
}

function buildMaterial(key, content) {
  if (key === 'emissive-pulse') {
    const material = standardMaterial(COLORS.cobalt, {
      emissive: COLORS.cobalt,
      emissiveIntensity: 0.2,
      roughness: 0.24,
    })
    const object = addMesh(content, new THREE.IcosahedronGeometry(0.95, 1), material)
    return time => {
      material.emissiveIntensity = 0.15 + wave01(time * 2.3) * 1.65
      object.rotation.y = time * 0.35
    }
  }

  if (key === 'wireframe-reveal') {
    const geometry = new THREE.TorusKnotGeometry(0.78, 0.25, 96, 12)
    const solidMaterial = standardMaterial(COLORS.cobalt, { transparent: true })
    const wireMaterial = basicMaterial(COLORS.cyan, { wireframe: true, transparent: true })
    const solid = addMesh(content, geometry, solidMaterial)
    const wire = addMesh(content, geometry.clone(), wireMaterial)
    return time => {
      const amount = smooth(wave01(time))
      solidMaterial.opacity = amount
      wireMaterial.opacity = 1 - amount * 0.7
      solid.rotation.y = wire.rotation.y = time * 0.4
    }
  }

  if (key === 'point-dissolve') {
    const geometry = new THREE.IcosahedronGeometry(1, 3)
    const solidMaterial = standardMaterial(COLORS.violet, { transparent: true })
    const pointsMaterial = new THREE.PointsMaterial({
      color: COLORS.cyan,
      size: 0.035,
      transparent: true,
    })
    const solid = addMesh(content, geometry, solidMaterial)
    const cloud = new THREE.Points(geometry.clone(), pointsMaterial)
    content.add(cloud)
    return time => {
      const amount = smooth(wave01(time * 0.9))
      solidMaterial.opacity = 1 - amount
      cloud.scale.setScalar(1 + amount * 0.55)
      pointsMaterial.opacity = 0.35 + amount * 0.65
      solid.rotation.y = cloud.rotation.y = time * 0.35
    }
  }

  if (key === 'hologram-scan') {
    const object = addMesh(
      content,
      new THREE.CylinderGeometry(0.72, 0.95, 1.7, 24, 5),
      basicMaterial(COLORS.cyan, {
        wireframe: true,
        transparent: true,
        opacity: 0.58,
      })
    )
    const scan = addMesh(
      content,
      new THREE.CylinderGeometry(1.08, 1.08, 0.035, 32),
      basicMaterial(COLORS.paper, { transparent: true, opacity: 0.9 })
    )
    return time => {
      scan.position.y = ((time * 0.9) % 2.5) - 1.25
      object.rotation.y = time * 0.38
      object.material.opacity = 0.45 + Math.sin(time * 9) * 0.08
    }
  }

  if (key === 'fresnel-shift') {
    const material = new THREE.MeshPhysicalMaterial({
      color: COLORS.violet,
      roughness: 0.18,
      metalness: 0.1,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [100, 700],
      clearcoat: 1,
      side: THREE.DoubleSide,
    })
    const object = addMesh(content, new THREE.TorusGeometry(0.86, 0.3, 24, 72), material)
    return time => object.rotation.set(Math.sin(time) * 0.4, time * 0.55, 0)
  }

  const material = new THREE.MeshPhysicalMaterial({
    color: COLORS.paper,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.95,
    thickness: 1.1,
    ior: 1.35,
    transparent: true,
    opacity: 0.82,
  })
  const object = addMesh(content, new THREE.TorusKnotGeometry(0.72, 0.3, 96, 16), material)
  addReferenceObjects(content, 5).scale.setScalar(0.75)
  return time => object.rotation.set(Math.sin(time) * 0.2, time * 0.45, 0)
}

function buildParticles(key, content) {
  if (key === 'particle-orbit') {
    const cloud = pointsFrom(260, index => {
      const angle = index * 2.399
      const radius = 0.65 + ((index * 17) % 100) / 100
      return [
        Math.cos(angle) * radius,
        Math.sin(index * 1.37) * 0.55,
        Math.sin(angle) * radius,
      ]
    })
    content.add(cloud)
    addMesh(content, new THREE.SphereGeometry(0.34, 20, 14), standardMaterial(COLORS.violet))
    return time => {
      cloud.rotation.y = time * 0.72
      cloud.rotation.x = Math.sin(time * 0.4) * 0.25
    }
  }

  if (key === 'particle-wave') {
    const columns = 18
    const rows = 12
    const cloud = pointsFrom(columns * rows, index => {
      const x = index % columns
      const z = Math.floor(index / columns)
      return [(x - columns / 2) * 0.16, 0, (z - rows / 2) * 0.16]
    }, { color: COLORS.cobalt, size: 0.06 })
    content.add(cloud)
    const positions = cloud.geometry.attributes.position
    return time => {
      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index)
        const z = positions.getZ(index)
        positions.setY(index, Math.sin(x * 3.2 + z * 2.2 + time * 2.4) * 0.32)
      }
      positions.needsUpdate = true
      cloud.rotation.x = -0.35
    }
  }

  if (key === 'particle-vortex') {
    const cloud = pointsFrom(320, (index, count) => {
      const height = index / count
      const angle = index * 0.55
      const radius = 0.18 + height * 1.25
      return [Math.cos(angle) * radius, height * 2.7 - 1.35, Math.sin(angle) * radius]
    }, { color: COLORS.violet, size: 0.052 })
    content.add(cloud)
    return time => {
      cloud.rotation.y = time * 1.4
      cloud.rotation.z = Math.sin(time * 0.5) * 0.12
    }
  }

  if (key === 'particle-fountain') {
    const count = 220
    const cloud = pointsFrom(count, () => [0, 0, 0], { color: COLORS.cyan, size: 0.06 })
    const positions = cloud.geometry.attributes.position
    const seeds = Array.from({ length: count }, (_, index) => ({
      phase: (index * 0.618) % 1,
      angle: index * 2.399,
      speed: 1.3 + ((index * 19) % 100) / 75,
    }))
    content.add(cloud)
    return time => {
      seeds.forEach((seed, index) => {
        const age = (time * 0.42 + seed.phase) % 1
        const radius = age * (0.35 + seed.speed * 0.24)
        positions.setXYZ(
          index,
          Math.cos(seed.angle) * radius,
          -1.1 + age * seed.speed * 2.4 - age * age * 2.2,
          Math.sin(seed.angle) * radius
        )
      })
      positions.needsUpdate = true
    }
  }

  if (key === 'starfield-warp') {
    const count = 300
    const cloud = pointsFrom(count, index => [
      Math.sin(index * 12.9898) * 2.4,
      Math.sin(index * 78.233) * 1.55,
      -((index * 0.37) % 5),
    ], { color: COLORS.paper, size: 0.045 })
    content.add(cloud)
    const positions = cloud.geometry.attributes.position
    return time => {
      for (let index = 0; index < positions.count; index += 1) {
        const base = -((index * 0.37) % 5)
        positions.setZ(index, ((base + time * 2.1 + 5) % 5) - 3.5)
      }
      positions.needsUpdate = true
      cloud.scale.z = 1.7
    }
  }

  const count = 180
  const cloud = pointsFrom(count, () => [0, 0, 0], { color: COLORS.warm, size: 0.075 })
  const positions = cloud.geometry.attributes.position
  const seeds = Array.from({ length: count }, (_, index) => ({
    phase: (index * 0.754) % 1,
    angle: index * 2.399,
    speed: 0.8 + ((index * 13) % 60) / 50,
  }))
  content.add(cloud)
  return time => {
    seeds.forEach((seed, index) => {
      const age = (time * 0.28 + seed.phase) % 1
      const spread = Math.sin(age * Math.PI) * seed.speed
      positions.setXYZ(
        index,
        Math.cos(seed.angle) * spread * 1.8,
        -0.8 + Math.sin(age * Math.PI) * 2.2 - age * 0.9,
        Math.sin(seed.angle) * spread
      )
    })
    positions.needsUpdate = true
  }
}

function buildGeometry(key, content) {
  if (key === 'cube-sphere-morph') {
    const geometry = new THREE.BoxGeometry(1.55, 1.55, 1.55, 9, 9, 9)
    const positions = geometry.attributes.position
    const starts = Float32Array.from(positions.array)
    const targets = Float32Array.from(starts)
    for (let index = 0; index < positions.count; index += 1) {
      const vector = new THREE.Vector3(
        starts[index * 3],
        starts[index * 3 + 1],
        starts[index * 3 + 2]
      ).normalize().multiplyScalar(1.08)
      targets[index * 3] = vector.x
      targets[index * 3 + 1] = vector.y
      targets[index * 3 + 2] = vector.z
    }
    const object = addMesh(content, geometry, standardMaterial(COLORS.cobalt, {
      wireframe: true,
    }))
    return time => {
      const amount = smooth(wave01(time * 0.85))
      for (let index = 0; index < positions.array.length; index += 1) {
        positions.array[index] = lerp(starts[index], targets[index], amount)
      }
      positions.needsUpdate = true
      object.rotation.set(time * 0.22, time * 0.36, 0)
    }
  }

  if (key === 'torus-twist') {
    const object = addMesh(
      content,
      new THREE.TorusKnotGeometry(0.72, 0.22, 128, 16, 2, 5),
      standardMaterial(COLORS.violet, { flatShading: true })
    )
    return time => object.rotation.set(time * 0.43, time * 0.72, Math.sin(time) * 0.22)
  }

  if (key === 'wave-grid') {
    const geometry = new THREE.PlaneGeometry(3.2, 2.2, 22, 16)
    const positions = geometry.attributes.position
    const base = Float32Array.from(positions.array)
    const object = addMesh(
      content,
      geometry,
      basicMaterial(COLORS.cyan, { wireframe: true, transparent: true, opacity: 0.75 })
    )
    object.rotation.x = -0.48
    return time => {
      for (let index = 0; index < positions.count; index += 1) {
        const x = base[index * 3]
        const y = base[index * 3 + 1]
        positions.setZ(index, Math.sin(x * 2.8 + y * 2 + time * 2.2) * 0.28)
      }
      positions.needsUpdate = true
    }
  }

  if (key === 'domino-chain') {
    const group = new THREE.Group()
    for (let index = 0; index < 10; index += 1) {
      addMesh(
        group,
        new THREE.BoxGeometry(0.18, 0.95, 0.46),
        standardMaterial(index % 2 ? COLORS.cyan : COLORS.cobalt),
        [(index - 4.5) * 0.32, -0.4, Math.sin(index * 0.55) * 0.38]
      )
    }
    content.add(group)
    return time => {
      const phase = (time * 1.25) % (group.children.length + 3)
      group.children.forEach((part, index) => {
        const amount = clamp(phase - index, 0, 1)
        part.rotation.z = -smooth(amount) * 1.24
      })
    }
  }

  if (key === 'stack-build') {
    const group = new THREE.Group()
    for (let index = 0; index < 7; index += 1) {
      const block = addMesh(
        group,
        new THREE.BoxGeometry(1.3 - index * 0.08, 0.28, 0.8),
        standardMaterial(index % 2 ? COLORS.violet : COLORS.cobalt),
        [0, -1 + index * 0.3, 0]
      )
      block.userData.level = index
    }
    content.add(group)
    return time => {
      const phase = (time * 1.7) % 9
      group.children.forEach((block, index) => {
        const amount = smooth(clamp(phase - index, 0, 1))
        block.scale.setScalar(0.35 + amount * 0.65)
        block.position.y = -1 + index * 0.3 + (1 - amount) * 1.5
      })
      group.rotation.y = Math.sin(time * 0.45) * 0.32
    }
  }

  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 9 }, (_, index) => new THREE.Vector3(
      (index - 4) * 0.42,
      Math.sin(index * 1.15) * 0.62,
      Math.cos(index * 0.7) * 0.4
    ))
  )
  const ribbon = addMesh(
    content,
    new THREE.TubeGeometry(curve, 96, 0.08, 8, false),
    standardMaterial(COLORS.cyan, { metalness: 0.25 })
  )
  return time => {
    ribbon.rotation.y = Math.sin(time * 0.55) * 0.55
    ribbon.rotation.x = Math.cos(time * 0.45) * 0.18
  }
}

function buildSpatialUI(key, content) {
  const panel = (width, height, depth, color) =>
    new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      standardMaterial(color, { roughness: 0.26, metalness: 0.08 })
    )

  if (key === 'card-tilt-3d') {
    const card = panel(2.15, 1.32, 0.12, COLORS.cobalt)
    content.add(card)
    addMesh(card, new THREE.BoxGeometry(1.45, 0.12, 0.035), basicMaterial(COLORS.paper), [0, 0.22, 0.09])
    addMesh(card, new THREE.BoxGeometry(0.92, 0.08, 0.035), basicMaterial(COLORS.cyan), [-0.27, -0.14, 0.09])
    return time => {
      card.position.y = Math.sin(time * 1.2) * 0.08
      card.rotation.z = Math.sin(time * 0.7) * 0.035
    }
  }

  if (key === 'spatial-carousel') {
    const carousel = new THREE.Group()
    for (let index = 0; index < 7; index += 1) {
      const angle = index / 7 * Math.PI * 2
      const card = panel(0.78, 1.08, 0.08, index % 2 ? COLORS.violet : COLORS.cobalt)
      card.position.set(Math.cos(angle) * 1.55, 0, Math.sin(angle) * 1.55)
      card.lookAt(0, 0, 0)
      card.rotateY(Math.PI)
      carousel.add(card)
    }
    content.add(carousel)
    return time => carousel.rotation.y = time * 0.55
  }

  if (key === 'radial-menu-depth') {
    const menu = new THREE.Group()
    const count = 8
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2
      const item = addMesh(
        menu,
        new THREE.CapsuleGeometry(0.17, 0.36, 4, 10),
        standardMaterial(index % 2 ? COLORS.cyan : COLORS.cobalt),
        [Math.cos(angle) * 1.28, Math.sin(angle) * 1.28, Math.sin(angle * 2) * 0.35]
      )
      item.rotation.z = angle + Math.PI / 2
    }
    addMesh(menu, new THREE.SphereGeometry(0.38, 20, 14), standardMaterial(COLORS.warm))
    content.add(menu)
    return time => {
      menu.rotation.z = Math.sin(time * 0.7) * 0.2
      menu.rotation.y = Math.sin(time * 0.5) * 0.35
    }
  }

  if (key === 'modal-depth-push') {
    const background = panel(2.5, 1.5, 0.08, COLORS.muted)
    const modal = panel(1.55, 0.92, 0.12, COLORS.cobalt)
    content.add(background, modal)
    modal.position.z = 0.8
    addMesh(modal, new THREE.BoxGeometry(0.95, 0.08, 0.03), basicMaterial(COLORS.paper), [0, 0.15, 0.08])
    return time => {
      const amount = smooth(wave01(time * 0.9))
      background.position.z = -amount * 0.65
      background.scale.setScalar(1 - amount * 0.12)
      modal.position.z = 0.15 + amount * 0.85
      modal.scale.setScalar(0.82 + amount * 0.18)
    }
  }

  if (key === 'data-bars-3d') {
    const bars = new THREE.Group()
    const heights = [0.8, 1.25, 1.7, 1.05, 1.55, 0.72, 1.38, 1.82]
    heights.forEach((height, index) => {
      const bar = addMesh(
        bars,
        new THREE.BoxGeometry(0.24, height, 0.42),
        standardMaterial(index % 3 === 0 ? COLORS.cyan : COLORS.cobalt),
        [(index - 3.5) * 0.34, -1 + height / 2, (index % 2) * 0.22]
      )
      bar.userData.height = height
      bar.userData.index = index
    })
    content.add(bars)
    return time => {
      bars.children.forEach(bar => {
        const amount = 0.18 + wave01(time * 1.3 - bar.userData.index * 0.36) * 0.82
        bar.scale.y = amount
        bar.position.y = -1 + bar.userData.height * amount / 2
      })
      bars.rotation.y = Math.sin(time * 0.35) * 0.28
    }
  }

  const anchor = addMesh(content, new THREE.SphereGeometry(0.72, 24, 16), standardMaterial(COLORS.violet))
  const stem = addLine(content, [new THREE.Vector3(0.3, 0.55, 0), new THREE.Vector3(1, 1.25, 0)])
  const tooltip = panel(1.25, 0.54, 0.08, COLORS.cobalt)
  tooltip.position.set(1.25, 1.3, 0)
  content.add(tooltip)
  addMesh(tooltip, new THREE.BoxGeometry(0.75, 0.07, 0.025), basicMaterial(COLORS.paper), [0, 0.08, 0.06])
  return time => {
    const offset = Math.sin(time * 1.7) * 0.12
    tooltip.position.y = 1.3 + offset
    stem.position.y = offset * 0.5
    anchor.rotation.y = time * 0.3
  }
}

function buildPhysics(key, content) {
  addFloor(content)

  if (key === 'gravity-drop') {
    const ball = addMesh(content, new THREE.SphereGeometry(0.48, 24, 16), standardMaterial(COLORS.warm))
    const shadow = addMesh(
      content,
      new THREE.CircleGeometry(0.48, 24),
      basicMaterial(COLORS.shadow, { transparent: true, opacity: 0.5 }),
      [0, -1.22, 0]
    )
    shadow.rotation.x = -Math.PI / 2
    return time => {
      const phase = (time * 0.58) % 1
      const height = 3.4 * phase * (1 - phase)
      ball.position.y = -0.72 + height
      shadow.scale.setScalar(1.2 - height * 0.22)
      shadow.material.opacity = 0.55 - height * 0.15
    }
  }

  if (key === 'collision-bounce') {
    const left = addMesh(content, new THREE.SphereGeometry(0.46, 20, 14), standardMaterial(COLORS.cobalt))
    const right = addMesh(content, new THREE.SphereGeometry(0.46, 20, 14), standardMaterial(COLORS.hot))
    return time => {
      const x = Math.abs(Math.sin(time * 1.35)) * 1.45
      left.position.set(-x, -0.72, 0)
      right.position.set(x, -0.72, 0)
    }
  }

  if (key === 'magnetic-attraction') {
    const group = new THREE.Group()
    const count = 10
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2
      const part = addMesh(
        group,
        new THREE.SphereGeometry(0.18, 14, 10),
        standardMaterial(index % 2 ? COLORS.cyan : COLORS.violet)
      )
      part.userData.angle = angle
      part.userData.index = index
    }
    content.add(group)
    addMesh(content, new THREE.OctahedronGeometry(0.42), standardMaterial(COLORS.warm))
    return time => {
      const radius = 0.58 + wave01(time * 1.1) * 1.2
      group.children.forEach(part => {
        const angle = part.userData.angle + time * (0.25 + part.userData.index * 0.01)
        part.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.7) * radius * 0.52,
          Math.sin(angle) * radius
        )
      })
    }
  }

  if (key === 'cloth-wave') {
    const geometry = new THREE.PlaneGeometry(2.8, 1.9, 22, 14)
    const positions = geometry.attributes.position
    const base = Float32Array.from(positions.array)
    const cloth = addMesh(
      content,
      geometry,
      standardMaterial(COLORS.cobalt, {
        side: THREE.DoubleSide,
        wireframe: true,
      })
    )
    cloth.position.y = 0.15
    return time => {
      for (let index = 0; index < positions.count; index += 1) {
        const x = base[index * 3]
        const y = base[index * 3 + 1]
        const falloff = (x + 1.4) / 2.8
        positions.setZ(index, Math.sin(x * 3.1 + y * 1.8 - time * 2.6) * 0.35 * falloff)
      }
      positions.needsUpdate = true
      cloth.rotation.y = -0.25
    }
  }

  const chain = new THREE.Group()
  const nodes = []
  for (let index = 0; index < 9; index += 1) {
    const node = addMesh(
      chain,
      new THREE.SphereGeometry(index === 0 ? 0.24 : 0.17, 14, 10),
      standardMaterial(index === 0 ? COLORS.warm : COLORS.cyan),
      [(index - 4) * 0.38, 0, 0]
    )
    nodes.push(node)
  }
  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nodes.length * 3), 3))
  const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: COLORS.paper }))
  chain.add(line)
  content.add(chain)
  return time => {
    const positions = lineGeometry.attributes.position
    nodes.forEach((node, index) => {
      node.position.y = Math.sin(time * 2 - index * 0.42) * 0.42 * (1 - index * 0.035)
      node.position.z = Math.cos(time * 1.45 - index * 0.35) * 0.2
      positions.setXYZ(index, node.position.x, node.position.y, node.position.z)
    })
    positions.needsUpdate = true
  }
}

function createScene(key) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0.7, 5)

  const root = new THREE.Group()
  const content = new THREE.Group()
  root.add(content)
  scene.add(root)

  scene.add(new THREE.HemisphereLight(COLORS.paper, COLORS.graphite, 2.5))
  const keyLight = new THREE.DirectionalLight(COLORS.paper, 3.2)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)

  let update = () => {}
  if ([
    'rotate-y', 'multi-axis-spin', 'object-orbit', 'spring-scale', 'squash-stretch',
    'float-bob', 'helix-rise', 'pendulum-swing', 'card-flip', 'explode-assemble',
  ].includes(key)) {
    update = buildTransform(key, content)
  } else if ([
    'camera-orbit', 'dolly-in', 'truck-pan', 'crane-rise', 'camera-shake', 'layer-parallax',
  ].includes(key)) {
    update = buildCamera(key, content, camera)
  } else if ([
    'light-sweep', 'rim-light-pulse', 'point-light-orbit', 'shadow-dance', 'temperature-shift',
  ].includes(key)) {
    update = buildLighting(key, scene, content)
  } else if ([
    'emissive-pulse', 'wireframe-reveal', 'point-dissolve',
    'hologram-scan', 'fresnel-shift', 'glass-refraction',
  ].includes(key)) {
    update = buildMaterial(key, content)
  } else if ([
    'particle-orbit', 'particle-wave', 'particle-vortex',
    'particle-fountain', 'starfield-warp', 'confetti-burst',
  ].includes(key)) {
    update = buildParticles(key, content)
  } else if ([
    'cube-sphere-morph', 'torus-twist', 'wave-grid',
    'domino-chain', 'stack-build', 'ribbon-flow',
  ].includes(key)) {
    update = buildGeometry(key, content)
  } else if ([
    'card-tilt-3d', 'spatial-carousel', 'radial-menu-depth',
    'modal-depth-push', 'data-bars-3d', 'spatial-tooltip',
  ].includes(key)) {
    update = buildSpatialUI(key, content)
  } else {
    update = buildPhysics(key, content)
  }

  return { scene, camera, root, update }
}

function disposeScene(entry) {
  entry.scene.traverse(object => {
    object.geometry?.dispose()
    if (Array.isArray(object.material)) {
      object.material.forEach(material => material.dispose())
    } else {
      object.material?.dispose()
    }
  })
}

function attachInteraction(entry) {
  const { stage } = entry

  stage.addEventListener('pointerdown', event => {
    entry.drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
    stage.setPointerCapture(event.pointerId)
    stage.dataset.dragging = 'true'
  })

  stage.addEventListener('pointermove', event => {
    if (!entry.drag || entry.drag.id !== event.pointerId) return
    const dx = event.clientX - entry.drag.x
    const dy = event.clientY - entry.drag.y
    entry.yaw += dx * 0.009
    entry.pitch = clamp(entry.pitch + dy * 0.007, -0.85, 0.85)
    stage.dataset.viewYaw = entry.yaw.toFixed(2)
    stage.dataset.viewPitch = entry.pitch.toFixed(2)
    entry.drag.x = event.clientX
    entry.drag.y = event.clientY
  })

  const release = event => {
    if (!entry.drag || entry.drag.id !== event.pointerId) return
    entry.drag = null
    stage.removeAttribute('data-dragging')
  }
  stage.addEventListener('pointerup', release)
  stage.addEventListener('pointercancel', release)

  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'ArrowLeft') entry.yaw -= 0.16
    if (event.key === 'ArrowRight') entry.yaw += 0.16
    if (event.key === 'ArrowUp') entry.pitch = clamp(entry.pitch - 0.13, -0.85, 0.85)
    if (event.key === 'ArrowDown') entry.pitch = clamp(entry.pitch + 0.13, -0.85, 0.85)
    if (event.key === 'Home') {
      entry.yaw = 0
      entry.pitch = -0.12
    }
    stage.dataset.viewYaw = entry.yaw.toFixed(2)
    stage.dataset.viewPitch = entry.pitch.toFixed(2)
  })
}

function markUnavailable() {
  document.querySelectorAll('.three-stage').forEach(stage => {
    stage.dataset.threeError = 'true'
    const loading = stage.querySelector('.three-stage__loading')
    if (loading) loading.textContent = 'WEBGL UNAVAILABLE'
  })
}

function syncStages(detail = {}) {
  allowMotion = detail.animate ?? allowMotion
  playbackRate = detail.speed ?? playbackRate
  COLORS = readPalette()

  entries.forEach(disposeScene)
  entries = []

  const stages = [...document.querySelectorAll('.three-stage')]
  if (!renderer || !stages.length || detail.dimension === '2d') {
    canvas.hidden = true
    cancelAnimationFrame(frameId)
    frameId = 0
    if (!renderer && stages.length) markUnavailable()
    return
  }

  canvas.hidden = false
  entries = stages.map((stage, index) => {
    const created = createScene(stage.dataset.threeKey)
    const entry = {
      ...created,
      stage,
      key: stage.dataset.threeKey,
      start: performance.now() - index * 42,
      yaw: 0,
      pitch: -0.12,
      drag: null,
    }
    attachInteraction(entry)
    stage.dataset.threeReady = 'true'
    stage.dataset.viewYaw = '0.00'
    stage.dataset.viewPitch = '-0.12'
    return entry
  })

  if (!frameId) frameId = requestAnimationFrame(renderFrame)
}

function resizeRenderer() {
  const width = innerWidth
  const height = innerHeight
  const pixelRatio = Math.min(devicePixelRatio, 1.5)
  const targetWidth = Math.floor(width * pixelRatio)
  const targetHeight = Math.floor(height * pixelRatio)
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
  }
}

function renderFrame(now) {
  frameId = 0
  if (!renderer || canvas.hidden || !entries.length) return

  resizeRenderer()
  renderer.setScissorTest(false)
  renderer.setViewport(0, 0, innerWidth, innerHeight)
  renderer.clear(true, true, true)
  renderer.setScissorTest(true)

  entries.forEach(entry => {
    const rect = entry.stage.getBoundingClientRect()
    const visible =
      rect.bottom > 0 &&
      rect.top < innerHeight &&
      rect.right > 0 &&
      rect.left < innerWidth &&
      !entry.stage.closest('.motion-card')?.hasAttribute('data-paused')

    if (!visible || rect.width < 2 || rect.height < 2) return

    const width = Math.min(rect.width, innerWidth - Math.max(0, rect.left))
    const height = Math.min(rect.height, innerHeight - Math.max(0, rect.top))
    const controlStrip = Math.min(28, Math.max(0, height - 2))
    const renderHeight = Math.max(1, height - controlStrip)
    const left = Math.max(0, rect.left)
    const bottom = Math.max(0, innerHeight - rect.bottom) + controlStrip

    entry.camera.aspect = rect.width / renderHeight
    entry.camera.updateProjectionMatrix()

    const elapsed = allowMotion
      ? ((now - entry.start) / 1000) * playbackRate
      : 0.85
    entry.update(elapsed)
    entry.root.rotation.x = entry.pitch
    entry.root.rotation.y = entry.yaw

    renderer.setViewport(left, bottom, width, renderHeight)
    renderer.setScissor(left, bottom, width, renderHeight)
    renderer.render(entry.scene, entry.camera)
  })

  renderer.setScissorTest(false)
  frameId = requestAnimationFrame(renderFrame)
}

window.addEventListener('motioncatalog:render', event => syncStages(event.detail))
window.addEventListener('motioncatalog:speed', event => {
  playbackRate = event.detail.speed || 1
})
window.addEventListener('motioncatalog:replay', event => {
  const entry = entries.find(item => item.key === event.detail.key)
  if (entry) entry.start = performance.now()
})

new MutationObserver(mutations => {
  const themeChanged = mutations.some(
    mutation => mutation.attributeName === 'data-theme',
  )
  if (themeChanged && document.querySelector('.three-stage')) {
    syncStages({
      dimension: '3d',
      animate: allowMotion,
      speed: playbackRate,
    })
  }
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
})

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && entries.length && !frameId) {
    frameId = requestAnimationFrame(renderFrame)
  }
})

syncStages({
  dimension: document.body.dataset.catalogDimension,
  animate: !matchMedia('(prefers-reduced-motion: reduce)').matches,
  speed: 1,
})
