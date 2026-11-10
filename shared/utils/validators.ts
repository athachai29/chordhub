const isEmailValid = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isPasswordValid = (password: string) => {
  return password.length >= 8
}

export { isEmailValid, isPasswordValid }
