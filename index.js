import express, { application } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import 'dotenv/config';
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

// Session initialization

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60,
    }
}));

// Passport initialization & config

app.use(passport.initialize());
app.use(passport.session());


// Global var

let loggedUserId;
let albumId = "";
let albumDetails = {
    detailsArtistName: "",
    detailsAlbumName: "",
    detailsAlbumYear: ""
};
let reviewArray = [];
let reviewId = [];
let selectArray = [];
let mbId = "";
let mbSearchArtistArr = [];
let mbSearchAlbumArr = [];

// Database connection

const db = new pg.Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PW,
    port: process.env.POSTGRES_PORT
});

db.connect();

// Root route

app.get("/", (req,res)=>{
    res.render("index.ejs");
});

// Explore route

app.get("/explore", (req,res)=>{
    res.render("explore.ejs");
});

app.post("/explore", async (req,res)=>{
    const searchKey = req.body.dialKey;

    switch(searchKey) {
        case "see-all":
            const allArtists = await db.query("SELECT * FROM artist ORDER BY artist_name");
            selectArray = allArtists.rows;
            res.render("select.ejs", {
                selectItems: selectArray
            });
            break;

        case "abc":
            const abcArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 'a' || '%' OR LOWER (artist_name) LIKE 'b' || '%' OR LOWER (artist_name) LIKE 'c' || '%' ORDER BY artist_name");
            selectArray = abcArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        case "def":
            const defArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 'd' || '%' OR LOWER (artist_name) LIKE 'e' || '%' OR LOWER (artist_name) LIKE 'f' || '%' ORDER BY artist_name");
            selectArray = defArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        case "ghi":
            const ghiArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 'g' || '%' OR LOWER (artist_name) LIKE 'h' || '%' OR LOWER (artist_name) LIKE 'i' || '%' ORDER BY artist_name");
            selectArray = ghiArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        case "jkl":
            const jklArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 'j' || '%' OR LOWER (artist_name) LIKE 'k' || '%' OR LOWER (artist_name) LIKE 'l' || '%' ORDER BY artist_name");
            selectArray = jklArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        case "mno":
            const mnoArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 'm' || '%' OR LOWER (artist_name) LIKE 'n' || '%' OR LOWER (artist_name) LIKE 'o' || '%' ORDER BY artist_name");
            selectArray = mnoArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        case "pqrs":
            const pqrsArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 'p' || '%' OR LOWER (artist_name) LIKE 'q' || '%' OR LOWER (artist_name) LIKE 'r' || '%' OR LOWER (artist_name) LIKE 's' || '%' ORDER BY artist_name");
            selectArray = pqrsArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        case "tuv":
            const tuvArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 't' || '%' OR LOWER (artist_name) LIKE 'u' || '%' OR LOWER (artist_name) LIKE 'v' || '%' ORDER BY artist_name");
            selectArray = tuvArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        case "wxyz":
            const wxyzArtists = await db.query("SELECT * FROM artist WHERE LOWER (artist_name) LIKE 'w' || '%' OR LOWER (artist_name) LIKE 'x' || '%' OR LOWER (artist_name) LIKE 'y' || '%' OR LOWER (artist_name) LIKE 'z' || '%' ORDER BY artist_name");
            selectArray = wxyzArtists.rows;
            res.render("select.ejs",{
                selectItems: selectArray
            });
            break;

        default:
            console.log("default triggered, searchKey =" + searchKey);
            res.redirect("/explore");
            break;
    }
});

// Artist route

app.post("/artist", async (req,res)=>{
    const artistId = req.body.artistSelect;
    try {
        const albumResult = await db.query("SELECT id, album_name FROM album WHERE artist_id = $1",[artistId]);
        selectArray = albumResult.rows;
        res.render("select.ejs",{
            selectItems:selectArray
        });
    } catch(error) {
        console.error("Failed to query album database", error.message);
    }
});

// Album route

app.post("/album", async (req,res)=>{
    albumId = req.body.albumSelect;
    console.log("albumId = ", albumId);
    try {
        const reviewResult = await db.query("SELECT * FROM review JOIN users ON review.user_id = users.id JOIN artist ON review.artist_id = artist.id JOIN album ON review.album_id = album.id WHERE review.album_id = $1",[albumId]);
        reviewResult.rows.forEach((el)=>{
            reviewId.push(el.id);
        });
        mbId = reviewResult.rows[0].mb_rgid;
        albumDetails = {
            detailsArtistName: reviewResult.rows[0].artist_name,
            detailsAlbumName: reviewResult.rows[0].album_name,
            detailsAlbumYear: reviewResult.rows[0].album_year
        }
        reviewArray = reviewResult.rows;
        console.log("reviewId = ", reviewId);
        res.redirect("/review");
    } catch(error) {
        console.error("failed query review table", error.message);
    }
});

// Review route

app.get("/review", async (req,res)=>{
    try {
        const mbResult = await axios.get("https://coverartarchive.org/release-group/" + mbId,{
                    headers: {
                        "User-Agent": process.env.API_USER_AGENT,
                        "Accept": "application/json"
                    }
                });
        res.render("review.ejs",{
            albumArt: mbResult.data.images[0].image,
            artistName: albumDetails.detailsArtistName,
            albumName: albumDetails.detailsAlbumName,
            yearNumber: albumDetails.detailsAlbumYear,
            textArray: reviewArray,
            loggedUserData: loggedUserId
        });
    } catch(error) {
        console.error("Failed to make discore database query", error.message);
    }
});

// My Discore route

app.get("/my-discore", (req, res) => {
    if (req.isAuthenticated() === true) {
        console.log("This is the user data", req.user);
        loggedUserId = req.user.id;
        res.render("myDiscore.ejs", {
            userName: req.user.user_name,
        });
    } else {
        res.redirect("/sign-in");
    }
});

// My reviews route

app.get("/my-reviews", async (req,res) => {
    try {
        const myResult = await db.query("SELECT review.id, review.artist_id, review.album_id, review.user_id, artist_name, album_name FROM review JOIN users ON review.user_id = users.id JOIN artist ON review.artist_id = artist.id JOIN album ON review.album_id = album.id WHERE users.id = $1 ORDER BY artist_name", [loggedUserId]);
        selectArray = myResult.rows;
        res.render("select.ejs", {
            selectItems: selectArray,
        });
    } catch (error) {
        console.error("Failed to make discore database query for my reviews", error.message);
    }
});

// View my review route

app.post("/view-my-review", async (req,res) => {
    try {
        const selectReviewId = req.body.reviewSelect;
        console.log("selectReviewId = ", selectReviewId);
        const myReviewResult = await db.query("SELECT review.id, review.review_title, review.review_text, review.rating, artist_name, album_name, mb_rgid, album_year FROM review JOIN users ON review.user_id = users.id JOIN artist ON review.artist_id = artist.id JOIN album ON review.album_id = album.id WHERE review.id = $1", [selectReviewId]);
        mbId = myReviewResult.rows[0].mb_rgid;
        albumDetails = {
            detailsArtistName: myReviewResult.rows[0].artist_name,
            detailsAlbumName: myReviewResult.rows[0].album_name,
            detailsAlbumYear: myReviewResult.rows[0].album_year
        }
        reviewArray = myReviewResult.rows;
        res.redirect("/review");
    } catch (error) {
        console.error("Failed to query data for view my review", error.message);
    }
});

// Edit my review route

app.post("/edit-my-review", (req,res) => {
    try {
        if (typeof loggedUserId !== undefined && reviewArray.length === 1) {
            console.log("review array = ", reviewArray);
            res.render("editMyReview.ejs", {
                artistName: reviewArray[0].artist_name,
                albumName: reviewArray[0].album_name,
                yearNumber: reviewArray[0].album_year,
                rating: reviewArray[0].rating,
                reviewTitle: reviewArray[0].review_title,
                reviewText: reviewArray[0].review_text
            });
        } else {
            res.redirect("/sign-in");
        }
    } catch (error) {
        console.error("Failed to post edit my review", error.message);
    }
});

// Update my review route

app.post("/update-my-review", async (req,res) => {
    try {
        const updatedReview = await db.query("UPDATE review SET rating = $1, review_title = $2, review_text = $3 WHERE id = $4 RETURNING rating AS new_rating, review_title AS new_review_title, review_text AS new_review_text", 
        [req.body.userScore, req.body.userTitle, req.body.userReviewText, reviewArray[0].id]);
        console.log(updatedReview.rows);
        reviewArray[0].rating = updatedReview.rows[0].new_rating;
        reviewArray[0].review_title = updatedReview.rows[0].new_review_title;
        reviewArray[0].review_text = updatedReview.rows[0].new_review_text;
        res.redirect("/review");
    } catch (error) {
        console.error("Failed to post submit my review", error.message);
    }
});

// Score route

app.get("/score", (req,res)=>{
    if (req.isAuthenticated() === true) {
        res.redirect("/search-artist");
    } else {
        res.redirect("/sign-in");
    }
});

// Search artist

app.get("/search-artist", (req,res) => {
    res.render("searchArtist.ejs");
});
app.post("/search-artist", async (req,res) => {
    try {
        const artistString = req.body.searchArtistName;
        const mbArtistResult = await axios.get(`https://musicbrainz.org/ws/2/artist?query=${artistString}&limit=5`, {
            headers: {
                "User-Agent": process.env.API_USER_AGENT,
                "Accept": "application/json",
            }
        });
        mbSearchArtistArr = mbArtistResult.data.artists;
        console.log(mbSearchArtistArr);
        res.redirect("/confirm-artist");
    } catch (error) {
        console.error("Failed to query musicbrainz for artist name", error.message);
    }
    
});

// Confirm artist route

app.get("/confirm-artist", (req,res) => {
    res.render("confirmArtist.ejs", {
        confirmArtistArr: mbSearchArtistArr,
    });
});
app.post("/confirm-artist", async (req,res) => {
    try {
        const mbArtistId = req.body.mbArtistId;
        const thisArtistName = mbSearchArtistArr.filter((item) => item.id === mbArtistId);
        console.log("mb artist id = ", mbArtistId);
        albumDetails.detailsArtistName = thisArtistName[0].name;
        console.log("albumDetails.artistName = ", albumDetails.detailsArtistName);
        const mbAlbumResult = await axios.get(`https://musicbrainz.org/ws/2/release-group?artist=${mbArtistId}&type=album|ep`);
        mbSearchAlbumArr = mbAlbumResult.data["release-groups"];
        res.redirect("/select-album");
    } catch (error) {
        console.error("Failed to query musicbrainz for albums | eps", error.message);
    }
    
});

// Select album route

app.get("/select-album", (req,res) => {
    console.log(mbSearchAlbumArr);
    res.render("selectAlbum.ejs", {
        selectAlbumArr: mbSearchAlbumArr,
    });
});
app.post("/select-album", (req,res) => {
    console.log(`selected albumId =  ${req.body.mbAlbumId}`);
    // Filter searchAlbumArr by albumId
    const thisAlbum = mbSearchAlbumArr.filter((item) => item.id === req.body.mbAlbumId);
    albumDetails.detailsAlbumName = thisAlbum[0].title;
    albumDetails.detailsAlbumYear = new Date(thisAlbum[0]["first-release-date"]).getFullYear();
    mbId = thisAlbum[0].id;
    console.log("this album = ", thisAlbum);
    res.render("submitMyReview.ejs", {
        successMessage: false,
        artistName: albumDetails.detailsArtistName,
        albumName: albumDetails.detailsAlbumName,
        yearNumber: albumDetails.detailsAlbumYear
    });
});

// Submit my review route

// Insert functions for artist, album, review

async function insertArtist(artistName) {
    const newArtist = await db.query("INSERT INTO artist (artist_name) VALUES ($1) RETURNING *",[artistName]);
    return newArtist;
}
async function insertAlbum(albumName, artistId, mbRgid, albumYear) {
    const newAlbum = await db.query("INSERT INTO album (album_name, artist_id, mb_rgid, album_year) VALUES ($1, $2, $3, $4) RETURNING *",
    [albumName, artistId, mbRgid, albumYear]);
    return newAlbum;
}
async function insertReview(reviewTitle, reviewText, reviewRating, artistId, albumId, userId) {
    const newReview = await db.query("INSERT INTO review (review_title, review_text, rating, artist_id, album_id, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [reviewTitle, reviewText, reviewRating, artistId, albumId, userId]);
    return newReview;
}

app.post("/submit-my-review", async (req,res) => {
    try {
        console.log(req.body);
        // Check if selected artist, album, review exists in artist, album & review tables
        const artistQuery = await db.query("SELECT * FROM artist WHERE artist_name = $1", [albumDetails.detailsArtistName]);
        const albumQuery = await db.query("SELECT * FROM album WHERE album_name = $1",[albumDetails.detailsAlbumName]);
        const reviewQuery = await db.query("SELECT * FROM review WHERE user_id = $1 AND artist_id = $2 AND album_id = $3", [loggedUserId, artistQuery.rows[0].id, albumQuery.rows[0].id]);
        
        if (reviewQuery.rows.length > 0) {
            console.log("duplicate data warning");
            res.render("submitMyReview.ejs", {
                successMessage: false,
                artistName: albumDetails.detailsArtistName,
                albumName: albumDetails.detailsAlbumName,
                yearNumber: albumDetails.detailsAlbumYear
            });
            return;
        } else if (artistQuery.rows.length === 0) {
            // Artist does not exist -> ergo insert artist, album & review with id
            
            const newArtistResult = await insertArtist(albumDetails.detailsArtistName);
            const newAlbumResult = await insertAlbum(albumDetails.detailsAlbumName, newArtistResult.rows[0].id, mbId, albumDetails.detailsAlbumYear);
            await insertReview(req.body.userTitle, req.body.userReviewText, req.body.userScore, newArtistResult.rows[0].id, newAlbumResult.rows[0].id, loggedUserId);

        } else if (artistQuery.rows.length > 0 && albumQuery.rows.length === 0) {
            // Artist exists, album does not exist -> insert album, review with id

            const newAlbumResult = await insertAlbum(albumDetails.detailsAlbumName, artistQuery.rows[0].id, mbId, albumDetails.detailsAlbumYear);
            await insertReview(req.body.userTitle, req.body.userReviewText, req.body.userScore, artistQuery.rows[0].id, newAlbumResult.rows[0].id, loggedUserId);
            
        } else if (artistQuery.rows.length > 0 && albumQuery.rows.length > 0) {
            // Artist & album exist -> insert review
            
            await insertReview(req.body.userTitle, req.body.userReviewText, req.body.userScore, artistQuery.rows[0].id, albumQuery.rows[0].id, loggedUserId);
        }
        res.render("submitMyReview.ejs", {
            successMessage: true,
            artistName: albumDetails.detailsArtistName,
            albumName: albumDetails.detailsAlbumName,
            yearNumber: albumDetails.detailsAlbumYear
        });
    } catch (error) {
        console.error("Failed to post data to submit my review route", error.message);
    }
});

// Sign in route

app.get("/sign-in", (req,res)=>{
    res.render("signIn.ejs");
});

// Sign out route

app.get("/sign-out", (req,res) => {
    loggedUserId;
    req.logout( (err) =>{
        if (err) console.log(err);
        res.redirect("/");
    });
});

// Log in with Google route

app.get("/log-in/google", passport.authenticate("google", {
    scope: ["profile", "email"],
}));

app.get("/auth/google", passport.authenticate("google", {
    successRedirect: "/my-discore",
    failureRedirect: "/sign-in",
}));

// Google strategy

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google"
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [profile._json.email]);
        if (result.rows.length === 0) {
            const newUser = await db.query("INSERT INTO users (user_name, email) VALUES ($1, $2)", [profile._json.name, profile_json.email]);
            cb(null, newUser.rows[0]);
        } else {
            cb(null, result.rows[0]);
        }
    } catch (err) {
        cb(err);
    }
}
));

// Serialize/deserialize user

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

// App listen port

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});