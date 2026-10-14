// All site content lives here. Edit this file to update the binder; no layout code needs to change.
// Everything below is PLACEHOLDER text. Replace it with the team's real content.

export type Spec = { label: string; value: string }
export type Alternative = { name: string; pros: string; cons: string; chosen?: boolean }
export type Iteration = { label: string; note: string }

export type Subsystem = {
  id: string
  name: string
  tagline: string
  summary: string
  /** Words that identify this subsystem's nodes in the exported GLB (case-insensitive). */
  nodeMatch: string[]
  specs: Spec[]
  alternatives: Alternative[]
  iterations: Iteration[]
  lessons: string[]
}

export const team = {
  number: '4087',
  name: 'Voodoo Voltage',
  location: 'New Orleans, LA',
  robotName: 'Robot Name',
  season: '2026 Season',
  tagline: 'How we designed, built, and competed with our robot.',
  logo: 'logo-full.png', // hero logo, file in /public
  icon: 'logo-icon.png', // nav + favicon, file in /public
}

export const heroStats: Spec[] = [
  { label: 'Weight', value: '000 lb' },
  { label: 'Drivetrain', value: 'Swerve' },
  { label: 'Frame', value: '00 x 00 in' },
  { label: 'Build time', value: '00 weeks' },
]

export const overview = {
  heading: 'Design philosophy',
  body: [
    'Describe the strategy the team chose at kickoff and why. Keep it to a short paragraph a judge can read in thirty seconds.',
    'Describe the priorities that drove every design decision, for example reliability, speed of build, or serviceability.',
  ],
  priorities: [
    { title: 'Priority one', text: 'What it means and how it showed up in the robot.' },
    { title: 'Priority two', text: 'What it means and how it showed up in the robot.' },
    { title: 'Priority three', text: 'What it means and how it showed up in the robot.' },
  ],
}

export const subsystems: Subsystem[] = [
  {
    id: 'drivetrain',
    name: 'Drivetrain',
    tagline: 'One line on what makes it ours.',
    summary: 'Describe the drivetrain: module type, gear ratio, motors, frame, and what drove those choices.',
    nodeMatch: ['drivetrain', 'drive', 'swerve', 'frame', 'chassis'],
    specs: [
      { label: 'Modules', value: 'TBD' },
      { label: 'Gear ratio', value: 'TBD' },
      { label: 'Free speed', value: 'TBD' },
      { label: 'Motors', value: 'TBD' },
    ],
    alternatives: [
      { name: 'Option A', pros: 'Why it was attractive.', cons: 'Why we passed.' },
      { name: 'Option B (chosen)', pros: 'Why it won.', cons: 'The trade-off we accepted.', chosen: true },
    ],
    iterations: [
      { label: 'V1', note: 'First prototype and what we learned.' },
      { label: 'V2', note: 'What changed and why.' },
      { label: 'Final', note: 'What competed.' },
    ],
    lessons: ['What worked.', 'What we would change next time.'],
  },
  {
    id: 'intake',
    name: 'Intake',
    tagline: 'One line on what makes it ours.',
    summary: 'Describe how game pieces are acquired: geometry, rollers or compliance, deployment, and packaging.',
    nodeMatch: ['intake'],
    specs: [
      { label: 'Deployment', value: 'TBD' },
      { label: 'Roller material', value: 'TBD' },
      { label: 'Motors', value: 'TBD' },
      { label: 'Width', value: 'TBD' },
    ],
    alternatives: [
      { name: 'Option A', pros: 'Why it was attractive.', cons: 'Why we passed.' },
      { name: 'Option B (chosen)', pros: 'Why it won.', cons: 'The trade-off we accepted.', chosen: true },
    ],
    iterations: [
      { label: 'V1', note: 'First prototype and what we learned.' },
      { label: 'Final', note: 'What competed.' },
    ],
    lessons: ['What worked.', 'What we would change next time.'],
  },
  {
    id: 'indexer',
    name: 'Indexer',
    tagline: 'One line on what makes it ours.',
    summary: 'Describe how game pieces are stored and fed to the scoring mechanism.',
    nodeMatch: ['indexer', 'hopper', 'feeder', 'conveyor'],
    specs: [
      { label: 'Capacity', value: 'TBD' },
      { label: 'Feed method', value: 'TBD' },
      { label: 'Motors', value: 'TBD' },
      { label: 'Sensors', value: 'TBD' },
    ],
    alternatives: [
      { name: 'Option A', pros: 'Why it was attractive.', cons: 'Why we passed.' },
      { name: 'Option B (chosen)', pros: 'Why it won.', cons: 'The trade-off we accepted.', chosen: true },
    ],
    iterations: [
      { label: 'V1', note: 'First prototype and what we learned.' },
      { label: 'Final', note: 'What competed.' },
    ],
    lessons: ['What worked.', 'What we would change next time.'],
  },
  {
    id: 'shooter',
    name: 'Shooter',
    tagline: 'One line on what makes it ours.',
    summary: 'Describe the scoring mechanism: flywheel or arm design, aiming method, and how it was tuned.',
    nodeMatch: ['shooter', 'turret', 'flywheel', 'hood'],
    specs: [
      { label: 'Aiming', value: 'TBD' },
      { label: 'Wheel size', value: 'TBD' },
      { label: 'Motors', value: 'TBD' },
      { label: 'Range', value: 'TBD' },
    ],
    alternatives: [
      { name: 'Option A', pros: 'Why it was attractive.', cons: 'Why we passed.' },
      { name: 'Option B (chosen)', pros: 'Why it won.', cons: 'The trade-off we accepted.', chosen: true },
    ],
    iterations: [
      { label: 'V1', note: 'First prototype and what we learned.' },
      { label: 'V2', note: 'What changed and why.' },
      { label: 'Final', note: 'What competed.' },
    ],
    lessons: ['What worked.', 'What we would change next time.'],
  },
]

export const software = {
  summary: 'Describe the software architecture: framework, command structure, autonomous approach, vision, and logging.',
  pillars: [
    { title: 'Architecture', text: 'How the robot code is organized.' },
    { title: 'Autonomous', text: 'How autos are built and tested.' },
    { title: 'Vision and localization', text: 'Cameras, coprocessors, and pose estimation.' },
    { title: 'Driver experience', text: 'Controls, automation, and overrides.' },
    { title: 'Testing and logging', text: 'How we validate before and during events.' },
  ],
}

export const fabrication = {
  summary: 'Describe how parts get made in-house: workflow from CAD to finished part, and what we outsource.',
  workflow: ['Design in Onshape', 'Release drawing or CAM file', 'Machine or print', 'Inspect and deburr', 'Assemble and test'],
  machines: [
    { name: 'Machine one', use: 'What it makes for us.', note: 'Constraints or tips.' },
    { name: 'Machine two', use: 'What it makes for us.', note: 'Constraints or tips.' },
    { name: '3D printers', use: 'Prototypes and small parts.', note: 'Materials and settings that worked.' },
  ],
  // Machining settings table. Fill in real, verified numbers before sharing publicly.
  settings: [
    { material: 'Material', tool: 'Tool', rpm: 'TBD', feed: 'TBD', depth: 'TBD' },
    { material: 'Material', tool: 'Tool', rpm: 'TBD', feed: 'TBD', depth: 'TBD' },
  ],
}

export type SeasonEvent = { name: string; date: string; result: string; note: string }

export const season = {
  summary: 'Tell the story of the season in a few sentences, including any mid-season changes.',
  timeline: [
    { when: 'Kickoff', title: 'Strategy and prototyping', text: 'What the team decided in the first week.' },
    { when: 'Week 2-3', title: 'First robot driving', text: 'What was working and what was not.' },
    { when: 'Week 4-6', title: 'Iteration', text: 'The biggest changes after early testing.' },
    { when: 'Competition', title: 'Events', text: 'How the robot held up under match conditions.' },
  ],
  events: [
    { name: 'Event one', date: 'Date', result: 'Rank / result', note: 'One line on what we learned.' },
    { name: 'Event two', date: 'Date', result: 'Rank / result', note: 'One line on what we learned.' },
  ] as SeasonEvent[],
}

export const resources = [
  { label: 'Onshape document', href: '#', note: 'Public CAD link' },
  { label: 'Robot code', href: 'https://github.com/frc4087', note: 'GitHub organization' },
  { label: 'Chief Delphi thread', href: '#', note: 'Build and Q&A' },
  { label: 'Scouting app', href: '#', note: 'VoodooScout' },
]

export const glossary = [
  { term: 'Term', def: 'Plain-language definition for judges and new students.' },
  { term: 'Term', def: 'Plain-language definition for judges and new students.' },
]

export const thanks = 'Thank you to our sponsors, mentors, school, and families.'
