export function generateRandomNumbers() {
  let numbers = ''
  for (let i = 0; i < 6; i++) {
    numbers += crypto.randomInt(0, 10)
  }
  return numbers
}
