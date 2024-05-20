export function validate(values) {
  const errors = {};

  //  TODO: add level validation
  if (!values.name) {
    errors.name = "required";
  }

  if (!values.designation) {
    errors.designation = "required";
  }

  if (!values.password) {
    errors.password = "required";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "required";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "value does not match with provided password";
  }

  return errors;
}
