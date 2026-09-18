export type ActivityCategory = 'water' | 'walking' | 'sightseeing'

export type Activity = {
  id: string
  name: string
  category: ActivityCategory
  duration: string
  cost: string
  costShort: string
  summary: string
  bring: string[]
  accent: string
  icon: string
  imageSrc?: string
  sourceUrl?: string
  verifiedOn?: string
}

export type Destination = {
  id: string
  name: string
  region: string
  coordinates: [number, number]
  shortDescription: string
  driveNote: string
  activities: Activity[]
}

export const destinations: Destination[] = [
  {
    id: 'pinawa',
    name: 'Pinawa',
    region: 'Eastern Manitoba',
    coordinates: [50.1489, -95.8814],
    shortDescription:
      'A small riverside town where an active afternoon and a quiet finish fit naturally into one day.',
    driveNote: 'About 1½ hours from Winnipeg — route estimate to be connected later.',
    activities: [
      {
        id: 'channel-tubing',
        name: 'Channel tubing',
        category: 'water',
        duration: '2–3 hours',
        cost: 'Current price to verify',
        costShort: '~$30 last visit*',
        summary:
          'A slow float through the Pinawa Channel. Booking generally includes a tube and personal flotation device.',
        bring: ['Water', 'Swimwear or quick-dry clothes', 'A dry change of clothes'],
        accent: '#e77d53',
        icon: '≈',
      },
      {
        id: 'suspension-bridge',
        name: 'Suspension bridge',
        category: 'sightseeing',
        duration: '15–30 minutes',
        cost: 'Likely free · access details to verify',
        costShort: 'Likely free*',
        summary:
          'A short scenic stop across the Pinawa Channel, best treated as a quick experience rather than a long hike.',
        bring: ['Comfortable walking shoes', 'Shoes with reliable grip'],
        accent: '#d5a44f',
        icon: '⌁',
      },
      {
        id: 'beach-swimming',
        name: 'Beach & swimming',
        category: 'water',
        duration: 'Flexible',
        cost: 'Access details to verify',
        costShort: 'Likely free*',
        summary:
          'An easy, unhurried way to finish the day. Stay briefly or settle in after the more structured activities.',
        bring: ['Swimwear', 'Towel', 'Water', 'Sun protection'],
        accent: '#4c94a0',
        icon: '◡',
      },
    ],
  },
]

export const categoryLabels: Record<ActivityCategory | 'all', string> = {
  all: 'Everything',
  water: 'On the water',
  walking: 'Walks',
  sightseeing: 'Scenic stops',
}
