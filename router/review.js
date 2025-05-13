const express = require("express");
const router = express.Router({mergeParams : true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const {reviewSchema} = require("../schema.js");
const {isLoggedIn, isReviewAuthor} = require("../middleware.js")

const ReviewController = require("../controllers/review.js");

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400,errMsg);
    } else {
        next();
    }
}

// Create Route
router.post("/", isLoggedIn, validateReview, wrapAsync(ReviewController.createReview))

// DELETE Review Route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(ReviewController.destroyReview))

module.exports = router;
