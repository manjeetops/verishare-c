export function validate(values) {
  const errors = {};

  //  TODO: add level validation
  if (!values.email) {
    errors.email = "required"
  }

  if (!values.password) {
    errors.password = "required"
  }

  return errors;
}