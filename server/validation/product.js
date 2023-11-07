import { isEmpty as _isEmpty, isLength, equals } from "validator";
import isEmpty from "is-empty";

export default function validateProductInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.medias = data.medias.length>0 ? data.medias : [];
  data.title = !isEmpty(data.title) ? data.title : "";
  data.price = data.price > 0 ? data.price : 0;
  data.category_id = !isEmpty(data.category_id) ? data.category_id : "";
  data.size = !isEmpty(data.size) ? data.size : "";
  data.quantity = data.quantity > 0 ? data.quantity : 0;
  data.description = !isEmpty(data.description) ? data.description : "";


  if (data.medias.length === 0) {
    errors.title = "Medias is required";
  }

  if (_isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  if (data.price === 0) {
    errors.price = "Price field is required";
  }

  if (data.quantity === 0) {
    errors.quantity = "Quantity field is required";
  }

  if (_isEmpty(data.size)) {
    errors.size = "Size field is required";
  }

  if (_isEmpty(data.category_id)) {
    errors.category_id = "Choose Category correctly";
  }

  if (_isEmpty(data.description)) {
    errors.description = "description field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
