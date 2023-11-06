/*
Register validator
Authored by Lee
Created At 2023/3/10
*/
import { isEmpty as _isEmpty, isLength, equals } from "validator";
import isEmpty from "is-empty";

export default function validateRegisterInput(req) {
  let errors = {};

  const data = req.body;
  // Convert empty fields to an empty string so we can use validator functions
  data.avatar = !isEmpty(data.avatar) ? data.avatar : "";
  data.fullname = !isEmpty(data.fullname) ? data.fullname : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.username = !isEmpty(data.username) ? data.username : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  //Avatar checks
  if (_isEmpty(data.avatar)) {
    errors.avatar = "Avatar is required";
  }

  //Name checks
  if (_isEmpty(data.fullname)) {
    errors.fullname = "Fullname is required";
  }

  //email checks
  if (_isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  //username checks
  if (_isEmpty(data.username)) {
    errors.username = "Username is required";
  }

  //Password checks
  if (_isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
