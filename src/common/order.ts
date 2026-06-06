// Returns a copy of `arr` rotated so the element at `startIdx` comes first.
// If `startIdx` is out of bounds, returns the array in original order.
export function rotateFrom<T>(arr: T[], startIdx: number): T[] {
  const n = arr.length
  if (n === 0 || startIdx < 0 || startIdx >= n) return [...arr]
  return Array.from({ length: n }, (_, i) => arr[(startIdx + i) % n])
}
