export function getRandomHash() {
  const rand = Math.random()
    .toString(36)
    .slice(2);
  return Buffer.from(rand).toString('base64');
}

export default {
  getRandomHash,
};
