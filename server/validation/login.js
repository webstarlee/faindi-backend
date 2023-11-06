/*
Login validator
Authored by Lee
Created At 2023/3/10
*/
import { isEmpty as _isEmpty } from "validator";
import isEmpty from "is-empty";

export default function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  //email checks
  if (_isEmpty(data.email)) {
    errors.email = "email field is required";
  }
  //Password checks
  if (_isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
