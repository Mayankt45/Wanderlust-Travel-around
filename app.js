const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/expressError.js");
const {listingSchema}=require("./schema.js");

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else next();
}


const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';

main().then(() =>{
    console.log("succesfuly connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
  }

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("Hi I am root");
});

// Index route
app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
}));

// New route
app.get("/listings/new",(req,res) =>{
    res.render("listings/new");
});

// Create route
app.post("/listings",validateListing,wrapAsync(async (req,res,next)=>{
    if(!req.body.listing){
        throw(new ExpressError(400,"Send valid data"));
    }
        let newListing=new Listing(req.body.listing); // creats new document
    await newListing.save();
    res.redirect("/listings");
}));

// Show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show",{listing});
}))

// Edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit",{listing});
}))

// Update route
app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    if(!req.body.listing){
        throw(new ExpressError(400,"Send valid data"));
    }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing}); // triple dot is a spred operator
    res.redirect("/listings");
}))

// Delete route
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error",{message});
})


// app.get("/testListing",async (req,res)=>{
//     let list1=new Listing ({
//         title:"My home",
//         description:"By ganga river",
//         price:5000,
//         location:"Mahesgang",
//         country:"Bharat",
//     });
//     await list1.save();
//     console.log("sample saved");
//     res.send("Listing saved");
// });

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});