# Robot model

Drop the Onshape export here as `robot.glb`. The viewer detects it automatically and replaces the built-in placeholder robot.

To make the isolate / ghost / explode controls work on your real model, name the top-level assemblies (or sub-assemblies) in the export so they contain the `nodeMatch` words listed for each subsystem in `src/content.ts`, for example `Intake`, `Shooter`, `Drivetrain`.

Onshape export tips:
- Export the assembly as glTF/GLB from the assembly tab (right-click the assembly tab, Export, glTF).
- Keep subsystem assemblies as separate sub-assemblies so they stay separate nodes.
- Large models: decimate or hide fasteners before export to keep the file under about 25 MB.
