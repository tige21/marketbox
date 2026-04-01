import clsx, { type ClassValue } from 'clsx'

export function bem(
  block: string,
  element?: string,
  modifiers?: Record<string, boolean>
): string {
  const base = element ? `${block}__${element}` : block
  if (!modifiers) return base
  const mods = Object.entries(modifiers)
    .filter(([, v]) => v)
    .map(([k]) => `${base}--${k}`)
  return [base, ...mods].join(' ')
}

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
