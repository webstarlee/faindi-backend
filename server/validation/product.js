import { isEmpty as _isEmpty, isLength, equals } from "validator";
import isEmpty from "is-empty";

export default function validateProductInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.title = !isEmpty(data.title) ? data.title : "";
  data.price = data.price > 0 ? data.price : 0;
  data.category_id = !isEmpty(data.category_id) ? data.category_id : "";
  data.size = !isEmpty(data.size) ? data.size : "";
  data.quantity = data.quantity > 0 ? data.quantity : 0;


  if (_isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  if (!data.price) {
    errors.price = "Price field is required";
  }

  if (!data.quantity) {
    errors.quantity = "Quantity field is required";
  }

  if (!data.size) {
    errors.size = "Size field is required";
  }

  if (_isEmpty(data.category_id)) {
    errors.category_id = "Choose Category correctly";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
