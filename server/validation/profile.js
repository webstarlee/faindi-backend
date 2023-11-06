import { isEmpty as _isEmpty, isLength, equals } from "validator";
import isEmpty from "is-empty";

export default function validateProfileInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.fullname = !isEmpty(data.fullname) ? data.fullname : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.username = !isEmpty(data.username) ? data.username : "";
  
  if (_isEmpty(data.fullname)) {
    errors.fullname = "Fullname is required";
  }

  if (_isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  if (_isEmpty(data.email)) {
    errors.email = "Email is required";
  }
  if (_isEmpty(data.username)) {
    errors.username = "Username is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
