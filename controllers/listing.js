const Listing=require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.map_token;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
}

module.exports.renderNewForm=(req,res) =>{
    res.render("listings/new");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({path: "reviews",populate:{
        path: "author",
    }
})
    .populate("owner");
    if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show",{listing});
};

module.exports.createListing=async (req,res,next)=>{
    // if(!req.body.listing){
    //     throw(new ExpressError(400,"Send valid data"));
    // }
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
    .send()
    
    let url = req.file.path;
    let filename=req.file.filename;
    console.log(url,"..",filename);
        let newListing=new Listing(req.body.listing); // creats new document
        newListing.geometry=response.body.features[0].geometry;
        newListing.owner=req.user._id;
        newListing.image={url,filename};
    let saved_listing=await newListing.save();
    console.log(saved_listing);
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
    }
    let originalImgUrl=listing.image.url;
    originalImgUrl=originalImgUrl.replace("/upload","/upload/h_300,w_250");
    console.log(originalImgUrl);
    res.render("listings/edit",{listing,originalImgUrl});
};

module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing}); // triple dot is a spred operator
    if(typeof req.file !=="undefined"){
        let url = req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect("/listings");
};

module.exports.deleteListing=async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};