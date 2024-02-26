export default defineEventHandler((event) => {
  const { method, path } = event

  console.debug(`${method} ${path}`)
})
