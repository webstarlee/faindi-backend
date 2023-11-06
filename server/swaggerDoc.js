export default {
    "openapi": "3.0.0",
    "info": {
      "title": "Faindi API",
      "version": "1.0.0",
      "description": "Faindi API"
    },
    "paths": {
      "/api/auth/signup": {
        "post": {
          "summary": "User Signup",
          "description": "Register a new user.",
          "requestBody": {
            "description": "User registration request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserSignupRequest"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User registration successful.",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "400": {
              "description": "Bad request. Invalid input data."
            }
          }
        }
      },
      "/api/auth/verify": {
        "post": {
          "summary": "User Verification",
          "description": "Verify user registration using a token and verification number.",
          "requestBody": {
            "description": "Verification request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserVerificationRequest"
                }
              }
            },
            "responses": {
              "200": {
                "description": "User verified successfully.",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              },
              "400": {
                "description": "Bad request. Invalid token or verification number."
              },
              "401": {
                "description": "Unauthorized. Invalid verification code."
              }
            }
          }
        }
      },
      "/api/auth/signin": {
        "post": {
          "summary": "User Sign-In",
          "description": "Authenticate and sign in a user.",
          "requestBody": {
            "description": "Sign-in request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserSigninRequest"
                }
              }
            },
            "responses": {
              "200": {
                "description": "User signed in successfully.",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              },
              "400": {
                "description": "Bad request. Invalid input data."
              },
              "401": {
                "description": "Unauthorized. Invalid credentials."
              },
              "403": {
                "description": "Forbidden. User not verified."
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "UserSignupRequest": {
          "type": "object",
          "properties": {
            "avatar": {
              "type": "string"
            },
            "fullname": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "username": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "roles": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "UserVerificationRequest": {
          "type": "object",
          "properties": {
            "token": {
              "type": "string"
            },
            "number": {
              "type": "string"
            }
          }
        },
        "UserSigninRequest": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          }
        },
        "User": {
          "$ref": "#/components/schemas/UserModel"
        },
        "UserModel": {
          "type": "object",
          "properties": {
            "avatar": {
              "type": "string"
            },
            "cover": {
              "type": "string"
            },
            "fullname": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "username": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "title": {
              "type": "string"
            },
            "bio": {
              "type": "string"
            },
            "roles": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "verified": {
              "type": "boolean"
            },
            "created_at": {
              "type": "string",
              "format": "date-time"
            }
          }
        }
      }
    }
  }