// TODO: Add authentication
// TODO: Check the database connectivity, external service dependencies, or any other critical functionality that impacts the overall service health

export default defineEventHandler(() => {
  return {
    status: "ok",
    message: "Service is running",
  }
})
