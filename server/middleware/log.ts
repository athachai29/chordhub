export default defineEventHandler((event) => {
  const method = getMethod(event)
  const { path } = event

  console.log(`${method} ${path}`)
})
