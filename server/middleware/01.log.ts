export default defineEventHandler((event) => {
  const {
    method,
    path,
    node: { req },
  } = event

  console.debug(`${method} ${path} ${JSON.stringify(req.headers)}`)
})
