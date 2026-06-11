const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const reviewController=require("../controllers/review.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middelware.js");


// Reviews post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview))

// Delete Review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview))

module.exports=router;