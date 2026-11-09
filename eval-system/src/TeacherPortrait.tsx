import type { CSSProperties } from 'react'

interface Props {
  name: string
  className: string
}

const skinTones = ['#e9b995', '#c98c68', '#f0c7a2', '#a96f50', '#dba17d', '#f2d0b1']
const hairColors = ['#302820', '#49332b', '#27252c', '#684b35', '#3b2b25']
const shirtColors = ['#37658e', '#72548a', '#39776f', '#9b604b', '#536c45', '#8a6c38']
const hairStyles = [
  <path key="hair" d="M25 57c0-31 16-48 40-48 26 0 41 18 39 48l-9-10-6-20c-18 15-38 20-64 18z" />,
  <path key="hair" d="M24 59c-2-32 14-50 41-50 27 0 43 18 39 52l-10 30-8-28-4-24c-19 14-38 19-57 17l-2 35-8-29z" />,
  <path key="hair" d="M25 60c-2-32 14-51 40-51 27 0 43 18 39 51l-12-9-4-20c-18 13-38 19-61 17zM89 25c7 4 12 13 14 25l-13-5z" />,
  <path key="hair" d="M24 58c-1-31 15-49 41-49 27 0 43 18 39 51l-9 10-4-33c-19 14-40 20-64 17l-1 16-9-12z" />,
]

function hashName(name: string): number {
  return Array.from(name).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0)
}

export default function TeacherPortrait({ name, className }: Props) {
  const hash = hashName(name)
  const palette = {
    skin: skinTones[hash % skinTones.length],
    hair: hairColors[Math.floor(hash / skinTones.length) % hairColors.length],
    shirt: shirtColors[Math.floor(hash / 7) % shirtColors.length],
    background: `hsl(${hash % 360} 43% 35%)`,
  }
  const style = {
    '--portrait-background': palette.background,
    '--portrait-hair': palette.hair,
    '--portrait-skin': palette.skin,
    '--portrait-shirt': palette.shirt,
  } as CSSProperties

  return (
    <svg className={`${className} teacher-portrait`} style={style} viewBox="0 0 128 128" aria-hidden="true">
      <rect width="128" height="128" rx="24" fill="var(--portrait-background)" />
      <circle cx="64" cy="50" r="43" fill="#ffffff" opacity=".1" />
      <path d="M16 128c4-29 20-43 48-43s44 14 48 43" fill="var(--portrait-shirt)" />
      <path d="m49 83 15 18 15-18-5-10H54z" fill="var(--portrait-skin)" />
      <path d="m49 84 15 17-11 13-17-24zm30 0-15 17 11 13 17-24z" fill="#f3f5f6" />
      <path d="M64 101 54 114l5 14h10l5-14z" fill="#d7e1eb" />
      <ellipse cx="64" cy="53" rx="27" ry="34" fill="var(--portrait-skin)" />
      <g fill="var(--portrait-hair)">{hairStyles[hash % hairStyles.length]}</g>
      <path d="M48 51c3-2 7-2 10 0m12 0c3-2 7-2 10 0" fill="none" stroke="#49352d" strokeLinecap="round" strokeWidth="2.5" />
      <ellipse cx="54" cy="57" rx="2" ry="2.5" fill="#29364a" />
      <ellipse cx="74" cy="57" rx="2" ry="2.5" fill="#29364a" />
      <path d="M58 70c4 4 8 4 12 0" fill="none" stroke="#a9574f" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  )
}
