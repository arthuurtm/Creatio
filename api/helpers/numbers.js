import { randomBytes } from 'node:crypto'

export function generateRandomNumbers() {
  let numbers = ''
  for (let i = 0; i < 6; i++) {
    const byte = randomBytes(1)[0]
    numbers += byte % 10
  }
  return numbers
}
