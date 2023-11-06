import { hashSync } from "bcryptjs";
import { Role, User } from "../models";

export default async function roleAdminSeed() {
  try {
    Role.estimatedDocumentCount().then(async (count) => {
      if (count === 0) {
        await Role({ name: "user" }).save();
        console.log("added 'user' to roles collection");
        await Role({ name: "admin" })
          .save()
          .then(async (role) => {
            console.log("added 'admin' to roles collection");
            await new User({
              avatar: "https://firebasestorage.googleapis.com/v0/b/faindi-24486.appspot.com/o/default.png?alt=media&token=c6abc142-0cd7-4300-a798-aa4d24bebbaa&_gl=1*128at3w*_ga*ODU4OTM0MDQ2LjE2OTM1OTAxMjI.*_ga_CW55HF8NVT*MTY5ODk0MTMxOC4zMi4xLjE2OTg5NDEzODUuNjAuMC4w",
              fullname: "Admin",
              email: "admin@mail.com",
              username: "admin",
              password: hashSync("123123", 8),
              verified: true,
              roles: [role._id],
            })
              .save()
              .then((err, user) => {
                console.log("Admin created from seed scripts");
              });
          });
      }
    });
  } catch (err) {
    console.error(err);
  }
}
