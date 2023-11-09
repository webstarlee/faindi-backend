const fs = require("fs");

export const imageToBase64 = (file) => {
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return Buffer.from(bitmap).toString("base64");
};

export const isWithinInterval = (startTime) => {
  const currentTime = Date.now();
  console.log(currentTime)
  const startDateTime = new Date(startTime).getTime();
  console.log(startDateTime)
  const differenceInMilliseconds = currentTime - startDateTime;
  const fifteenMinutesInMilliseconds = 15 * 60 * 1000; // 15 minutes in milliseconds

  return differenceInMilliseconds < fifteenMinutesInMilliseconds;
};
