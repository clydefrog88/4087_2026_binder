import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
        mat.roughness = 0.55
        mat.metalness = 0
        mesh.material = mat
        entries.push({ mesh, group })
      })
    }
    // Center on the footprint and sit on the floor (model space is Z-up).
    const box = new THREE.Box3().setFromObject(model)
    const c = box.getCenter(new THREE.Vector3())
    model.position.set(-c.x, -c.y, -box.min.z)
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
    scene.environmentIntensity = 0.85
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

export function Viewer(props: Props & { autoRotate?: boolean }) {
  const { state, url } = useGlbAvailable()
  return (
    <div className="viewer" aria-label="3D robot viewer">
      <Canvas flat shadows camera={{ position: [1.9, 1.4, 2.2], fov: 38 }} dpr={[1, 2]}>
        <StudioEnv />
        <hemisphereLight args={['#ffffff', '#9a93a8', 0.25]} />
        <directionalLight position={[3, 5, 2]} intensity={1.1} castShadow />
        <Suspense fallback={null}>
          <Spin enabled={props.autoRotate ?? false}>
            {state === 'yes' ? <GlbRobot url={url} {...props} /> : <PlaceholderRobot {...props} />}
          </Spin>
          <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={4} blur={2.4} far={2} />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={1.2} maxDistance={6} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
      {state === 'no' && <span className="viewer-note">Placeholder model. Add public/models/robot.glb</span>}
    </div>
  )
}
