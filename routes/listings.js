const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/expressError.js");
const {listingSchema}=require("../schema.js");
const Listing=require("../models/listing.js");



const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else next();
}

// Index route
router.get("/",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
}));

// New route
router.get("/new",(req,res) =>{
    res.render("listings/new");
});

// Create route
router.post("/",validateListing,wrapAsync(async (req,res,next)=>{
    if(!req.body.listing){
        throw(new ExpressError(400,"Send valid data"));
    }
        let newListing=new Listing(req.body.listing); // creats new document
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
}));

// Show route
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
}))

// Edit route
router.get("/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
    }
    res.render("listings/edit",{listing});
}))

// Update route
router.put("/:id",validateListing,wrapAsync(async (req,res)=>{
    if(!req.body.listing){
        throw(new ExpressError(400,"Send valid data"));
    }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing}); // triple dot is a spred operator
    req.flash("success", "Listing Updated");
    res.redirect("/listings");
}))

// Delete route
router.delete("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}))

module.exports=router;