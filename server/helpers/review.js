import Review from "../models/review.model";

const getAverageReview = async (user_id) => {
  if (user_id) {
    const reviews = await Review.find({ user_id });
    if (reviews?.length) {
      let sumReviews = 0;
      for (const review of reviews) {
        sumReviews += review.rate;
      }
      return {
        rate: Math.round(sumReviews / reviews.length),
        count: reviews.length,
      };
    } else {
      return {
        rate: 0,
        count: 0,
      };
    }
  }
};

export { getAverageReview };
