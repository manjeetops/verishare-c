export function validate(values) {
  const errors = {};

  //  TODO: add level validation
  if (!values.description) {
    errors.description = "required";
  }

  return errors;
}
