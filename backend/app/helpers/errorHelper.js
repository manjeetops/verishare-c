export default (code, msg) => {
  const err = new Error(msg)
  err.status = code
  return err
}
