import path from "path";
import { imageToBase64 } from "../modules/helpers";
import { uploadCategoryImgToFirebase } from "../modules/firebase";
import { Category } from "../models";

export default async function categorySeed() {
  try {
    Category.estimatedDocumentCount().then(async (count) => {
      if (count === 0) {
        const category_img_one = path.join(__dirname, "../../public/images/cat1.jpg");
        const category_img_two = path.join(__dirname, "../../public/images/cat2.jpg");
        const category_img_three = path.join(__dirname, "../../public/images/cat3.jpg");
        const category_img_four = path.join(__dirname, "../../public/images/cat4.jpg");
        const category_img_five = path.join(__dirname, "../../public/images/cat5.jpg");
        const cat_data = [
          {
            title: "Clothing",
            img: category_img_one
          },
          {
            title: "Accessories",
            img: category_img_two
          },
          {
            title: "home decor",
            img: category_img_three
          },
          {
            title: "tools & material",
            img: category_img_four
          },
          {
            title: "patterns",
            img: category_img_five
          },
        ]
        cat_data.map(async (category) => {
          const base64Img = imageToBase64(category.img);
          const imgName = Date.now();
          const imgResult = await uploadCategoryImgToFirebase(base64Img, imgName);
          await new Category({
            cat_title: category.title,
            cat_img: imgResult,
          })
            .save()
            .then((err, user) => {
              console.log("category added from seed scripts");
            });
        })
      }
    });
  } catch (err) {
    console.error(err);
  }
}
