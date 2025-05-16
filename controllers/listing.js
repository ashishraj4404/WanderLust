const Listing = require("../models/listing.js");

module.exports.index = async (req,res) => {
    const { q, priceMin, priceMax } = req.query;
    let allListings;
    if(q) {
         allListings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },  // Case-insensitive search by place
        { category: { $in: [q.toLowerCase()] } }
      ]
    });
    }
    else if(priceMin && priceMax) {
        allListings = await Listing.find({price : { $gt : Number(priceMin),  $lt : Number(priceMax) }});
    }
    else {
        allListings = await Listing.find({});
    }
    
    res.render("listings/index.ejs", {allListings});
}

module.exports.renderNewListing = (req,res) => {
    res.render("listings/new.ejs");
}


module.exports.createListing = async (req,res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    console.log(newListing);
    await newListing.save();
    console.log("added successfully");
    req.flash("success", "New Listing Added Successfully");
    res.redirect("/listings");
}

module.exports.showListing = async (req,res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate : { path : "author"}}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing your requested for does not exit");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}

module.exports.editListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing your requested for does not exit");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
}

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing);

    if( typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }

    console.log("updated successfully");
    req.flash("success", "Listing Updated Successfully");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    console.log("deleted successfully");
    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/listings");
}