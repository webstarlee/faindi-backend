import admin from "firebase-admin";

// Import your service account credentials
// const serviceAccount = require("./sharestest-3ca53-firebase-adminsdk-7gekq-b5d50328d3.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "faindi-24486",
    private_key_id: "0abc421a1b8816af5f102280afebb986aba0735d",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRK1T6zOH4HSi7\nVZtAmomgQ6MKvEevH69w9ujGqIkHqNZnuJ7mP66jdHWktz0r35NbMsaPTkBJaEn/\nU8nJ1WictrKc4r+Xya5Y831LaKjXFbHiaGeKjTp7xh/J15xcVZihAHCG3WoqLEOX\nITx2Bf5AJOuCAGL+aXcYaRFXjOG6YVuqlhg1H8W14PGWJrx21RstXeBTKFMN1jUK\nAHOfzzZGAcbdp8yaDpn27y7aL3U6qhhb6j7KIi1ZCVWEvZY50NMNKmrHpt9jMSrM\nweDUY1WrcFlyEmFlaB5NsSr8ghR5uY+NoZXFAh7ajURHJAuX1yu3NrIDwU5ozPz7\ny4I9IrsnAgMBAAECggEAA300WhXYBx1/ANdfhmcnHvQOrWH3bowAW/zVl5eKgZ6a\nK1/z0DKe8fColB2b+M/H7ROE85fO9rdPB+IYuADGHlpMOTwgptWHm2NxMAE7Uvf0\nearBxcvi5KgPZUlVcGAOv1DHwvHA9zPtBLTA0qJfwifB54jXt33m4KwpmX5EhA/B\nimktsqUthaiXYrJHyscqLUaLdtE2TxoUAJhPECzJ0CBocT0FQldzj7crJARC5eWl\nxN1jlPePqRSKHO98ZIP75YDjGG08PY8SsPFunuVJhAX7/17tX9ZOdN0S8a9FoKUC\nSpc6BK5gVKd90RKyUhl6sZAN4ubSVp/Df1rl2heDEQKBgQD7pFud9PFZFUk3llVD\nuogxLHmcVv9/3xzguUqSxieRU3tzpORLlEHEguNw/2wHXZ02ci4Am0oxmuow2XkV\nqY52QAmewS6U+q/mFxx9DSNRXakvAKVP0vs/Ear6mn2YPuvplSm0V9AZVpKpEi1N\nt5lFCjujMTnU/fi2FqdfhEkYiwKBgQDUyqxa0aIRSmPGt8VGF994p0SSiUFiPJcR\nju2ZLE55LTQ7C0WushSDl/AYh9Fz6jlEPXxxVkrE+52xY/wos2QUs6daqHED+EMD\nUvuTGTucldVmExI4u/7tqqooDlHUlHvXtZttHCwSG2Qn3FNV/zMhcZss2ps6sc6g\n1lenCIZfVQKBgQCDadzSi6UygXRADEkw2ovfKjvEEobRj4G0Ne+k4MivEyrIRNdY\nRO9noXcHfsw6uH+ufEhb1r0TVLRymE+sqWSVinG7r2UVNil//pfJEoBcMI521l5+\nZk8BK8ffoahvRoTK8jPaU3WAlf53Pt/b00K+lE56te1ettcYuJHlxt6pawKBgGpf\nGkOYEbUlA7Wdvf7pBiwxKYU7GbU65qW/ViTA0kWfBEITw3StzrVtqXcJxfl098WW\nGvQpF91ajpzTh4TtEDWNDTazhzNd0loCDIKfFX6UJAYPuIcl6yzxqHe3mM50n2fY\nf+bOM3Wlva5zZDFUDkJEoTaN3RU9NzaNj2mPSGS1AoGAaLnUtx26wV7gv7nauPYU\nAdgHWL1s+pfQJdV7CRFqtDOXVgboEhvhuiXJdWM9UyjaFCXFSg/Vfec6oIgJIm5E\n8ZwpYtOt2zWdmrL8mQvAlVdoxhfM/UBTG85lGQVJ5gGjr/viG7PNrGfbuxHNeNK2\nw4IpBmm7uJzLAaYimFag6WY=\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-uzedg@faindi-24486.iam.gserviceaccount.com",
    client_id: "110058644161426844000",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uzedg%40faindi-24486.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
  storageBucket: "faindi-24486.appspot.com",
});

const bucket = admin.storage().bucket();

const userFolder = "users";
const messageFolder = "messages";
const productFolder = "products";
const categoryFolder = "categories";
const mainFolder = "faindi";

const metadata = {
  contentType: "image/jpg",
  contentDisposition: "inline",
};

function base64ToImg(base64) {

  return {
    base64: base64,
    extname: ".jpg",
  };
}

async function uploadMessageImgToFirebase(data, name) {
  const result = base64ToImg(data);
  const filepath = `${mainFolder}/${messageFolder}/${name}${result.extname}`;
  const file = bucket.file(filepath);

  try {
    await file.save(Buffer.from(result.base64, "base64"), {
      metadata: metadata,
    });

    const signedUrls = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // This is just an arbitrary far-future date.
    });

    return signedUrls[0];
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

async function uploadUserImgToFirebase(data, name) {
  const result = base64ToImg(data);
  const filepath = `${mainFolder}/${userFolder}/${name}${result.extname}`;
  const file = bucket.file(filepath);

  try {
    await file.save(Buffer.from(result.base64, "base64"), {
      metadata: metadata,
    });

    const signedUrls = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // This is just an arbitrary far-future date.
    });

    return signedUrls[0];
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

async function uploadCategoryImgToFirebase(data, name) {
  const result = base64ToImg(data);
  const filepath = `${mainFolder}/${categoryFolder}/${name}${result.extname}`;
  const file = bucket.file(filepath);

  try {
    await file.save(Buffer.from(result.base64, "base64"), {
      metadata: metadata,
    });

    const signedUrls = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return signedUrls[0];
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

async function uploadProductImgToFirebase(data, name) {
  const result = base64ToImg(data);
  const filepath = `${mainFolder}/${productFolder}/${name}${result.extname}`;
  const file = bucket.file(filepath);

  try {
    await file.save(Buffer.from(result.base64, "base64"), {
      metadata: metadata,
    });
    console.log("Uploaded a base64 string to Firebase!");

    const signedUrls = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return signedUrls[0];
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

async function uploadProductVideoToFirebase(data, name) {
  const filepath = `${mainFolder}/${productFolder}/${name}${".mp4"}`;
  const file = bucket.file(filepath);

  try {
    await file.save(Buffer.from(data, "base64"), {
      contentType: "video/mp4",
    });
    console.log("Uploaded a video file to Firebase!");

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // This is just an arbitrary far-future date.
    });

    return url;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

async function uploadChatMediaToFirebase(data, name) {
  const filepath = `${mainFolder}/${productFolder}/${name}${data?.originalname}`;
  const file = bucket.file(filepath);
  const type = data.mimetype.split("/")[0];
  try {
    await file.save(data.buffer, {
      contentType: data.mimetype,
    });
    console.log("Uploaded a media file to Firebase!");

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // This is just an arbitrary far-future date.
    });

    return { file: url, type: type };
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

async function getUserImgUrlFromFirebase(filename) {
  const file = bucket.file(`${mainFolder}/${userFolder}/${filename}`);

  try {
    const signedUrls = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return signedUrls[0];
  } catch (error) {
    throw error;
  }
}

async function getCategoryImgUrlFromFirebase(filename) {
  const file = bucket.file(`${mainFolder}/${categoryFolder}/${filename}`);

  try {
    const signedUrls = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return signedUrls[0];
  } catch (error) {
    throw error;
  }
}

async function getProductImgUrlFromFirebase(filename) {
  const file = bucket.file(`${mainFolder}/${productFolder}/${filename}`);

  try {
    const signedUrls = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return signedUrls[0];
  } catch (error) {
    throw error;
  }
}

async function uploadImage(filePath) {
  try {
    await bucket.upload(filePath);
    console.log("Image uploaded successfully");
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

export {
  uploadMessageImgToFirebase,
  uploadUserImgToFirebase,
  uploadProductVideoToFirebase,
  uploadCategoryImgToFirebase,
  uploadProductImgToFirebase,
  getUserImgUrlFromFirebase,
  getCategoryImgUrlFromFirebase,
  getProductImgUrlFromFirebase,
  uploadImage,
  uploadChatMediaToFirebase,
};
