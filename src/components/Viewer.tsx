import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { subsystems } from '../content'

export type ViewMode = 'isolate' | 'ghost'
type Props = { selected: string | null; mode: ViewMode; explode: number }

const ACCENT = '#3e8d30'
const BASE_COLOR = '#6d5a8a'
const GHOST_OPACITY = 0.1

const explodeDirs: Record<string, [number, number, number]> = {
  drivetrain: [0, -1, 0],
  intake: [1, 0, 0],
  indexer: [0, 0.6, 0],
  shooter: [0, 1.2, 0],
}

function useGlbAvailable() {
  const [state, setState] = useState<'checking' | 'yes' | 'no'>('checking')
  const url = `${import.meta.env.BASE_URL}models/robot.glb`
  useEffect(() => {
    let live = true
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? ''
        if (live) setState(r.ok && !type.includes('text/html') ? 'yes' : 'no')
      })
      .catch(() => live && setState('no'))
    return () => {
      live = false
    }
  }, [url])
  return { state, url }
}

function styleFor(groupId: string, selected: string | null, mode: ViewMode) {
  const active = selected === null || selected === groupId
  if (active) return { visible: true, opacity: 1, color: selected === groupId ? ACCENT : BASE_COLOR }
  if (mode === 'isolate') return { visible: false, opacity: 0, color: BASE_COLOR }
  return { visible: true, opacity: GHOST_OPACITY, color: BASE_COLOR }
}

function Part({
  group, selected, mode, explode, position, size, shape = 'box',
}: {
  group: string; selected: string | null; mode: ViewMode; explode: number
  position: [number, number, number]; size: [number, number, number]; shape?: 'box' | 'cyl'
}) {
  const s = styleFor(group, selected, mode)
  const dir = explodeDirs[group] ?? [0, 0, 0]
  const pos: [number, number, number] = [
    position[0] + dir[0] * explode, position[1] + dir[1] * explode, position[2] + dir[2] * explode,
  ]
  return (
    <mesh position={pos} visible={s.visible} castShadow>
      {shape === 'box' ? <boxGeometry args={size} /> : <cylinderGeometry args={[size[0], size[0], size[1], 32]} />}
      <meshStandardMaterial
        color={s.color} transparent opacity={s.opacity}
        depthWrite={s.opacity >= 1} roughness={0.55} metalness={0.15}
      />
    </mesh>
  )
}

/** Stand-in robot made of primitives, grouped by subsystem. Replaced automatically by public/models/robot.glb. */
function PlaceholderRobot(p: Props) {
  const c = { selected: p.selected, mode: p.mode, explode: p.explode }
  const corners: [number, number][] = [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]]
  return (
    <group position={[0, 0.05, 0]}>
      <Part {...c} group="drivetrain" position={[0, 0.12, 0]} size={[0.9, 0.08, 0.9]} />
      {corners.map(([x, z], i) => (
        <Part key={i} {...c} group="drivetrain" shape="cyl" position={[x, 0.06, z]} size={[0.07, 0.1, 0.07]} />
      ))}
      <Part {...c} group="intake" position={[0.6, 0.2, 0]} size={[0.28, 0.14, 0.75]} />
      <Part {...c} group="indexer" position={[0.05, 0.3, 0]} size={[0.5, 0.2, 0.55]} />
      <Part {...c} group="shooter" shape="cyl" position={[-0.05, 0.55, 0]} size={[0.22, 0.12, 0.22]} />
      <Part {...c} group="shooter" position={[0.05, 0.68, 0]} size={[0.38, 0.14, 0.2]} />
    </group>
  )
}

type Entry = { mesh: THREE.Mesh; group: string | null }
type Node = { obj: THREE.Object3D; group: string; base: THREE.Vector3 }

// Depth-fighting fix. Where two parts have flush (coplanar) faces the GPU cannot decide which
// is in front, so it flickers between their colors. Each part gets a tiny, fixed depth bias by
// size rank: smaller parts are pulled slightly toward the camera, so a small part sitting flush
// in a larger one always wins. Tune with the three constants below.
const Z_TIERS = 10 // number of size tiers (more tiers = fewer ties between similar-size parts)
const Z_FACTOR_STEP = -0.5 // slope-scaled bias per tier
const Z_UNITS_STEP = -1 // constant bias per tier

// Parts that must win wherever they are flush with another part, regardless of size. The bumper is
// the largest part, so the size rule above would otherwise let the small parts it overlaps show
// through it. The bias is a fraction of a millimeter, so it only decides near-coplanar contact and
// never makes the part show through anything that is genuinely behind it.
const ALWAYS_ON_TOP = ['bumpers'] // exact part names, case-insensitive
const TOP_FACTOR = -2
const TOP_UNITS = -100

function isAlwaysOnTop(obj: THREE.Object3D) {
  for (let o: THREE.Object3D | null = obj; o; o = o.parent) {
    if (ALWAYS_ON_TOP.includes(o.name.trim().toLowerCase())) return true
  }
  return false
}

function applyDepthBias(model: THREE.Object3D, entries: Entry[]) {
  model.updateMatrixWorld(true)
  const box = new THREE.Box3()
  const size = new THREE.Vector3()
  const diag = entries.map((e) => box.setFromObject(e.mesh).getSize(size).length())
  const largestFirst = [...diag.keys()].sort((a, b) => diag[b] - diag[a])
  largestFirst.forEach((idx, rank) => {
    const tier = Math.floor((rank / entries.length) * Z_TIERS)
    const mat = entries[idx].mesh.material as THREE.Material
    mat.polygonOffset = tier > 0
    mat.polygonOffsetFactor = Z_FACTOR_STEP * tier
    mat.polygonOffsetUnits = Z_UNITS_STEP * tier
  })
  for (const { mesh } of entries) {
    if (!isAlwaysOnTop(mesh)) continue
    const mat = mesh.material as THREE.Material
    mat.polygonOffset = true
    mat.polygonOffsetFactor = TOP_FACTOR
    mat.polygonOffsetUnits = TOP_UNITS
  }
}

function GlbRobot({ url, selected, mode, explode }: Props & { url: string }) {
  const { scene } = useGLTF(url, false)
  const { model, entries, nodes } = useMemo(() => {
    const model = scene.clone(true)
    const entries: Entry[] = []
    const nodes: Node[] = []
    // Onshape exports Z-up with the subsystems as direct children of the "Robot" node.
    const robot = model.getObjectByName('Robot') ?? model
    for (const child of robot.children) {
      const name = child.name.toLowerCase()
      const hit = subsystems.find((x) => x.nodeMatch.some((m) => name.includes(m)))
      const group = hit ? hit.id : null
      if (hit) nodes.push({ obj: child, group: hit.id, base: child.position.clone() })
      child.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        const mat = ((Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial).clone()
        // Onshape writes its sRGB color values into glTF's baseColorFactor, which glTF defines as
        // linear. Read as linear they come out much lighter than in Onshape (washed out, grays
        // instead of blacks), so reinterpret the numbers as sRGB.
        mat.color.setRGB(mat.color.r, mat.color.g, mat.color.b, THREE.SRGBColorSpace)
        mat.roughness = 0.75
        mat.metalness = 0
        mesh.material = mat
        entries.push({ mesh, group })
      })
    }
    // Center on the footprint and sit on the floor (model space is Z-up).
    const box = new THREE.Box3().setFromObject(model)
    const c = box.getCenter(new THREE.Vector3())
    model.position.set(-c.x, -c.y, -box.min.z)
    applyDepthBias(model, entries)
    return { model, entries, nodes }
  }, [scene])

  useEffect(() => {
    for (const { mesh, group } of entries) {
      const mat = mesh.material as THREE.MeshStandardMaterial
      const s = group ? styleFor(group, selected, mode) : { visible: false, opacity: 1 }
      mesh.visible = s.visible
      mat.transparent = s.opacity < 1
      mat.opacity = s.opacity
      mat.depthWrite = s.opacity >= 1
      if (selected && group === selected) mat.emissive.set('#0a2a06')
      else mat.emissive.set('#000000')
    }
    for (const { obj, group, base } of nodes) {
      // Explode directions are defined in world space (Y-up); convert to the Z-up model space.
      const d = explodeDirs[group] ?? [0, 0, 0]
      obj.position.set(base.x + d[0] * explode, base.y - d[2] * explode, base.z + d[1] * explode)
    }
  }, [entries, nodes, selected, mode, explode])

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={model} />
    </group>
  )
}

/** Procedural studio lighting. No network download, so it works offline and on any host. */
function StudioEnv() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.2
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function Spin({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (enabled && ref.current) ref.current.rotation.y += dt * 0.2
  })
  return <group ref={ref}>{children}</group>
}

export function Viewer(props: Props & { autoRotate?: boolean; onInteract?: () => void }) {
  const { state, url } = useGlbAvailable()
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  return (
    <div className="viewer" aria-label="3D robot viewer">
      <Canvas flat shadows camera={{ position: [1.9, 1.4, 2.2], fov: 38 }} dpr={[1, 2]}>
        <StudioEnv />
        <hemisphereLight args={['#ffffff', '#8a8496', 0.03]} />
        <directionalLight position={[3, 5, 2]} intensity={3.4} castShadow />
        {/* Weak back-left light so shaded sides keep some shape without lifting the blacks. */}
        <directionalLight position={[-4, 2, -3]} intensity={0.7} />
        {/* Faint fill from below so the underside is readable when orbiting under the robot. */}
        <directionalLight position={[-2, -3, 2]} intensity={0.25} />
        <Suspense fallback={null}>
          <Spin enabled={props.autoRotate ?? false}>
            {state === 'yes' ? <GlbRobot url={url} {...props} /> : <PlaceholderRobot {...props} />}
          </Spin>
          <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={4} blur={2.4} far={2} />
        </Suspense>
        <OrbitControls
          ref={controls}
          enablePan
          minDistance={1.2}
          maxDistance={6}
          onStart={props.onInteract}
        />
      </Canvas>
      <button type="button" className="chip viewer-reset" onClick={() => controls.current?.reset()}>
        Reset view
      </button>
      <span className="viewer-hint">
        <span className="hint-mouse">Drag: orbit · Scroll: zoom · Right-drag: pan</span>
        <span className="hint-touch">Drag: orbit · Pinch: zoom · Two fingers: pan</span>
      </span>
      {state === 'no' && <span className="viewer-note">Placeholder model. Add public/models/robot.glb</span>}
    </div>
  )
}
