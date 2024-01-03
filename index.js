import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import 'dotenv/config';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

// Global var

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
        console.log(selectArray);
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
    console.log(albumId);
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
        console.log(reviewId);
        res.redirect("review");
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
            textArray: reviewArray
        });
    } catch(error) {
        console.error("Failed to make discore database query", error.message);
    }
});

// Score route

app.get("/score", (req,res)=>{
    res.render("soon.ejs");
});

// Sign in route

app.get("/sign-in", (req,res)=>{
    res.render("soon.ejs");
});

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});