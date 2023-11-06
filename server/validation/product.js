import { isEmpty as _isEmpty, isLength, equals } from "validator";
import isEmpty from "is-empty";

export default function validateProductInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.title = !isEmpty(data.title) ? data.title : "";
  data.price = data.price > 0 ? data.price : 0;
  data.cat_id = !isEmpty(data.cat_id) ? data.cat_id : "";

  if (_isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  if (!data.price) {
    errors.price = "Price field is required";
  }

  if (_isEmpty(data.cat_id)) {
    errors.cat_id = "Choose Category correctly";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
