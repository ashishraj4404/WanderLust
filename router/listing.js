const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn, isOwner} = require("../middleware.js")
const ListingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js")
const upload = multer({storage});

const validateListing = (req,res,next) => {
    const {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400,errMsg);
    } else {
        next();
    }
}

router.route("/")
    .get(wrapAsync(ListingController.index))
    .post(
        isLoggedIn, 
        upload.single("listing[image]"), 
        // validateListing,
        wrapAsync(ListingController.createListing)
    );

// New Route
router.get("/new", isLoggedIn, ListingController.renderNewListing)

router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"),  validateListing, ListingController.updateListing)
    .delete(isLoggedIn, isOwner, ListingController.destroyListing);

// Edit Route
router.get("/:id/edit",isLoggedIn, isOwner, ListingController.editListing)


module.exports = router;