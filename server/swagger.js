const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    restapi: "3.1.0",
    info: {
      title: "Faindi API",
      version: "1.0.0",
      description: "Faindi API",
    },
  },
  apis: ["./routes/auth.routes.js"],
};

const specs = swaggerJsdoc(options);

export { specs };
