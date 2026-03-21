export const NEXUS_COLORS = [
  { id: 'blue', name: 'sky blue', bg: '#e0f2fe', text: '#0369a1', primary: '#0ea5e9' },
  { id: 'orange', name: 'sunset orange', bg: '#ffedd5', text: '#c2410c', primary: '#f97316' },
  { id: 'green', name: 'emerald green', bg: '#dcfce7', text: '#15803d', primary: '#10b981' },
  { id: 'pink', name: 'rose pink', bg: '#fce7f3', text: '#be185d', primary: '#ec4899' },
  { id: 'purple', name: 'royal purple', bg: '#f3e8ff', text: '#7e22ce', primary: '#a855f7' },
  { id: 'yellow', name: 'amber gold', bg: '#fef3c7', text: '#b45309', primary: '#f59e0b' },
  { id: 'indigo', name: 'indigo night', bg: '#e0e7ff', text: '#4338ca', primary: '#6366f1' },
  { id: 'teal', name: 'ocean teal', bg: '#ccfbf1', text: '#0f766e', primary: '#14b8a6' },
];

export type NexusColor = typeof NEXUS_COLORS[number];

export const getColorById = (id: string) => 
  NEXUS_COLORS.find(c => c.id === id) || NEXUS_COLORS[0];
