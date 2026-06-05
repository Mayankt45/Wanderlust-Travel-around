const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/expressError.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


app.use(
    session({
        secret: "mysupersecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 7*24*60*60*1000,
            maxAge:7*24*60*60*1000,
            httpOnly:true,
        },
    })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



const listingRouter=require("./routes/listings.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/user.js");

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

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUsr=req.user;
    next();
});

// app.get("/demouser",async (req,res)=>{
//     let fakeUser=new User({
//         email:"abc@gmail.com",
//         username:"delta-student",
//     })
//     let registeredUser= await User.register(fakeUser,"mayank");
//     res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
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