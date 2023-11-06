import { isEmpty as _isEmpty } from "validator";
import isEmpty from "is-empty";

export default function validateProfileInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.fullname = !isEmpty(data.fullname) ? data.fullname : "";
  data.username = !isEmpty(data.username) ? data.username : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.bio = !isEmpty(data.bio) ? data.bio : "";
  
  if (_isEmpty(data.fullname)) {
    errors.fullname = "Fullname is required";
  }

  if (_isEmpty(data.username)) {
    errors.username = "Username is required";
  }

  if (_isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  if (_isEmpty(data.bio)) {
    errors.bio = "Bio is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
