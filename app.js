const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const https = require('https');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const nodeHtmlToImage = require('node-html-to-image'); // Add this line
const cors = require('cors');
const { ApifyClient } = require('apify-client');
const request = require('request');
const Domain = "http://tattlingelk.com:3000"; //Enter the host domain here in order for deepfakes to work
const ApifyKey = 'apify_api_oZOjgZvVdOXIRyqbWsvAMV4p1CBYjm1AuqoZ'//API key for the Apify cloud platform used for the processing of the deepfakes
var imagecount = 8;//Image counter is used for the auto image generator of the deepfake code to generate images in a sequential order
var firebasecounter = imagecount;//At the start of the code these 2 are always equal, it changes furing the upload process of the deepfakes.


// Load your service account key JSON file
let serviceAccount = require('./test.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'test-aaa1a', // replace with your Firebase project ID
  keyFilename: './test.json' // path to your service account key JSON file
});

const bucket = storage.bucket('gs://test-aaa1a.appspot.com'); // replace with your bucket name

// Serve static files from the main folder
app.use(express.static(path.join(__dirname, '/')));

// Increase the limit for incoming JSON payloads
app.use(express.json({ limit: '50mb' })); // Middleware to parse JSON bodies

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Face filter requisites
app.use(cors()); // cors adds headers to allow cross-platform requests

//app.use(bodyParser.json({ limit: '20mb' })); // use body-parser package to parse json requests

// Endpoint for storing the filter images
app.post('/save-image', (req, res) => {
  const { filterImg, filterImg2, filterImg3, filterImg4 } = req.body;
  const base64Data = filterImg.replace(/^data:image\/png;base64,/, '');
  const screenshotName = 'filter-img.png';
  const screenshotFilePath = path.join(__dirname, 'images', screenshotName);
  // repeat the process for the other filter images
  const base64Data2 = filterImg2.replace(/^data:image\/png;base64,/, '');
  const screenshotName2 = 'filter-img2.png';
  const screenshotFilePath2 = path.join(__dirname, 'images', screenshotName2);
  
  const base64Data3 = filterImg3.replace(/^data:image\/png;base64,/, '');
  const screenshotName3 = 'filter-img3.png';
  const screenshotFilePath3 = path.join(__dirname, 'images', screenshotName3);
  
  const base64Data4 = filterImg4.replace(/^data:image\/png;base64,/, '');
  const screenshotName4 = 'filter-img4.png';
  const screenshotFilePath4 = path.join(__dirname, 'images', screenshotName4);

    // Save all filter images asynchronously
    const saveImage = (filePath, base64Data) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, base64Data, 'base64', (err) => {
          if (err) {
            return reject(err);
          }
          console.log('Filter image saved successfully:', filePath);
          resolve();
        });
      });
    };
  
    Promise.all([
      saveImage(screenshotFilePath, base64Data),
      saveImage(screenshotFilePath2, base64Data2),
      saveImage(screenshotFilePath3, base64Data3),
      saveImage(screenshotFilePath4, base64Data4),
    ])
    .then(() => {
      res.status(200).send({ message: 'All filter images saved successfully' });
    })
    .catch(err => {
      console.error('Error saving filter images:', err);
      res.sendStatus(500);
    });
  }
);

// Endpoint to receive and store data
app.post('/storeData', function (req, res, next) {
  const { age, gender, emotion, picture } = req.body;
  imagecount = 8;
  firebasecounter = imagecount;

  // Convert base64 image to binary
  const base64Data = picture.replace(/^data:image\/png;base64,/, '');
  const imgFileName = "1.png"; // Always set the filename as "1.png"
  const imgFilePath = path.join(__dirname, 'images', imgFileName);

  // Save image to file
  fs.writeFileSync(imgFilePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.sendStatus(500); // Respond with error status
    }
  });

  // Delete old image from Firebase Storage
  const oldFile = bucket.file(`images/${imgFileName}`);
  oldFile.exists()
    .then((data) => {
      const exists = data[0];
      if (exists) {
        return oldFile.delete();
      } else {
        console.log('No such file exists, skipping delete.');
        return Promise.resolve();
      }
    })
    .then(() => {
      console.log('Old image successfully deleted from Firebase Storage.');
    })
    .catch((err) => {
      console.error('Error deleting old image from Firebase Storage:', err);
      return res.sendStatus(500); // Respond with error status
    });


  // All the variables needed for the fake profile data
  // Variables needed for Image 2
  const image2FileName = "2.png"; //Filename for the image
  const image2FilePath = path.join(__dirname, 'images', image2FileName); //Path for the image
  // vars for image 3 - tiktok profile
  const image3FileName = "3.png"; // Filename for the image
  const image3FilePath = path.join(__dirname, 'images', image3FileName); // Path for the image
  // vars for image 4
  const image4FileName = "4.png"; // Filename for the image
  const image4FilePath = path.join(__dirname, 'images', image4FileName); // Path for the image

  const image5FileName = "5.png"; // Filename for the image
  const image5FilePath = path.join(__dirname, 'images', image5FileName); // Path for the image
  // vars for the filter app and instagram ad page
  const image6FileName = "6.png"; // Filename for the filter app ui
  const image6FilePath = path.join(__dirname, 'images', image6FileName); // Path for the image
  const image7FileName = "7.png"; // Filename for the instgram ad page
  const image7FilePath = path.join(__dirname, 'images', image7FileName); // Path for the image

  // variables for the filter imgs
  // convert the Stallone filter picture to data URI format
  const filterImg = fs.readFileSync('./images/filter-img.png');
  const filterImgBase64 = new Buffer.from(filterImg).toString('base64');
  const filterImgDataURI = 'data:image/jpeg;base64,' + filterImgBase64;
  // convert the makeup filter picture to data URI format
  const filterImg2 = fs.readFileSync('./images/filter-img2.png');
  const filterImg2Base64 = new Buffer.from(filterImg2).toString('base64');
  const filterImg2DataURI = 'data:image/jpeg;base64,' + filterImg2Base64; 
  // convert the devil horns filter picture to data URI format
  const filterImg3 = fs.readFileSync('./images/filter-img3.png');
  const filterImg3Base64 = new Buffer.from(filterImg3).toString('base64');
  const filterImg3DataURI = 'data:image/jpeg;base64,' + filterImg3Base64;
  // convert the vendetta mask filter picture to data URI format
  const filterImg4 = fs.readFileSync('./images/filter-img4.png');
  const filterImg4Base64 = new Buffer.from(filterImg4).toString('base64');
  const filterImg4DataURI = 'data:image/jpeg;base64,' + filterImg4Base64;

  // map the user interests to remote ad links
  const ads = {
    "Technology": {
      "url": "https://cdn1.thecomeback.com/wp-content/uploads/sites/94/2023/06/313F4A3C-A666-4F35-AEFE-94882105AA97-832x447.jpeg",
      "company": "apple"
    },
    "Sports": {
      "url": "https://i.pinimg.com/originals/cf/a2/52/cfa252a34a2a94a8f056fc7fa735e23c.png",
      "company": "adidas"
    },
    "Games": {
      "url": "https://cdn.mobygames.com/promos/9775781-final-fantasy-xv-magazine-advertisement-edge-united-kingdom-issu.jpg",
      "company": "final_fantasy"
    },
    "Fashion": {
      "url": "https://media.cnn.com/api/v1/images/stellar/prod/151007164244-diesel-s-s15-by-nick-knight.jpg?q=w_640,h_404,x_0,y_0,c_fill",
      "company": "diesel"
    },
    "Movies": {
      "url": "https://subcultureentertainment.com/wp-content/uploads/2024/03/Furiosa-Poster.jpg",
      "company": "warner_bros"
    },
    "Music": {
      "url": "https://d2joqs9jfh6k92.cloudfront.net/wp-content/uploads/2023/12/11171907/Nicki-Minaj-Twitter-1200x675.jpg",
      "company": "nicki_minaj_official_europe"
    },
    "Art": {
      "url": "https://down-ph.img.susercontent.com/file/b6013d4baaf31e0cbc7f0b271c8fa2cb",
      "company": "winsor_and_newton"
    },
    "Travel": {
      "url": "https://spillingthemarketingbeans.com/wp-content/uploads/2017/07/the-anatomy-of-an-ad-turkish-airlines.png",
      "company": "turkish-airlines"
    }
  };
  function getAd(interest){
    return ads[interest].url;
  }
  function getCompany(interest){
    return ads[interest].company;
  }
  // declare the vars for the interests that are going to be used to create the three ads
  let ad1, ad2, ad3;
  // declare the vars for the ads links
  let ad1Src, ad2Src, ad3Src;
  // declare the var for the company name in the first ad
  let ad1Company;
  // declare the var for the username
  let username, fullName;
  // fetch the user name and interests from userinfo.json
  let firstName, lastName, interests;
  fsPromises.readFile(path.join(__dirname, 'userinfo.json'), 'utf8')
  .then((data) => JSON.parse(data))
  .then((json) => {
    console.log('user info read: ', json);
    firstName = json.firstName;
    lastName = json.lastName;
    interests = json.interests;
    console.log(`firstName is ${firstName}, lastName is ${lastName}, interests are ${interests}`);
    if (interests.length >= 3) {
      ad1 = interests[0];
      ad2 = interests[1];
      ad3 = interests[2];
    }
    else if (interests.length === 2) {
      ad1 = interests[0];
      ad2 = interests[1];
      ad3 = ad1;
    }
    else {
      ad1 = interests[0];
      ad2 = ad1;
      ad3 = ad1;
    }
    // create a username for the user from their names by
    // combining their first name, an underscore, first letter of last name and a number
    let usernamePart1 = firstName.toLowerCase();
    let usernamePart2 = lastName.toLowerCase().slice(0, 1);
    username = usernamePart1.concat('_', usernamePart2, '123');
    fullName = firstName.concat(' ', lastName);
    // the links for the ads displayed in the profile
    ad1Src = getAd(ad1);
    ad2Src = getAd(ad2);
    ad3Src = getAd(ad3);
    ad1Company = getCompany(ad1);
    console.log('ad1Company is ', ad1Company, 'username is ', username);
  })
  .catch((error) => {
    console.error('Error reading or parsing user info:', error);
  });

  const profilepic = 'data:image/jpeg;base64,' + base64Data; //Data used to import the profilepicture (image 1)
  const ScannerAge = req.body.age; //Get the users age based on scanner
  const currentMood = req.body.emotion//Get the users current mood based on the scan
  var MoodResponse = ""

  if (currentMood == "happy") {
    MoodResponse = "I am happy right now"
  } else {
    MoodResponse = "I am anything but happy"
  }

  // Function to create a Twitter profile image and upload it to Firebase
async function createTwitterProfileImage(profilepic, username, fullName, image4FilePath, image4FileName) {
  await nodeHtmlToImage({
      content: { imageSource: profilepic, usernameSrc: username, nameSrc: fullName },
      output: image4FilePath,
      html: `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Twitter Clone</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
      </head>
      <body>
          <style>
              /* Stle reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: sans-serif;
      }
      body{
        margin: 0;
        display: flex;
        width: 1436px;
        height: 720px;
    }
      @font-face {
        font-family: "Roboto";
        src: url(../assets/Roboto-Regular.ttf);
      }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 1.2rem;
        line-height: 1.6;
      }
      
      a {
        text-decoration: none;
      }
      ul {
        list-style: none;
      }
      
      /* Main Containers */
      .main-flex-container {
        max-width: 1350px;
        margin: auto;
        margin-top: 15px;
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
      }
      .left-flex-container {
        flex: 1 0 22%;
        height: 100%;
        position: sticky;
        top: 0;
        background:#fff; 
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        border-right: 1px solid rgb(230, 236, 240);
      }
      .center-flex-container {
       flex: 3 0 45%;
       background:#fff;
      }
      .right-flex-container {
        flex: 2 0 31%;
        height: 100%;
        width: 100%;
        position: sticky;
        top: 0;
        background:#fff;
        border-left: 1px solid rgb(230, 236, 240);
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
      }
      
      /* Left Navigation */
      .logo i{
        color: #000000;
        font-size: 2rem;
        padding: 1rem;
      }
      .nav-links a {
        font-weight: 750;
        color: rgba(44, 46, 48, 0.93);
        padding: 10px 15px;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      
      .current-page a { color: black}
      .nav-items {
        white-space: nowrap;
        display: flex;
        align-items: center;
      }
      .nav-links i {
        padding-right: 0.5rem;
      }
      .nav-links {
        margin-top: -1rem;
      }
      
      .tweet a {
        display: block;
        margin: auto;
        width: 100%;
        color: #fff;
        background: #1da1f2;
        font-size: 1rem;
        font-weight: 700;
        padding: 10px 5rem;
        border-radius: 25px;
      }
      .profile-box {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
        margin-top: 1.5rem;
        align-self: center;
        padding: 0 0.6rem;
      }
      .profile-box img {
        display: block;
        width: 80px;
        height: 80px;
        margin: auto;
        border-radius: 100%;
        margin-right: 0.5rem;
        object-fit: cover;
      }
      
      .profile-box .full-name {
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .profile-box .options-icon {
        color: #39393a;
        margin-left: 1rem;
      }
      
      .user-name {
        color: #39393a;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        font-size: 1.1rem;
      }
      
      /* Main Container */
      .home {
        display: flex;
        top: 0;
        background: #fff;
        border-bottom: 1px solid rgb(230, 236, 240);
        color: #39393a;
        padding: 0rem 1rem;
        margin-left: 60px;
        justify-content: space-between;
        margin-right: 100px;
      }
      .home-text {
          display: flex;
          margin-left: 380px;
      }
      .home p{
         margin-left: 0px;
      }
      .underline {
          border-bottom: 4px solid #1da1f2; /* Adjust the thickness here */
          padding-bottom: 10px; /* Adjust the distance from the text here */
        }
      
      /* home panel */
      .home h1 {
        font-size: 1.2rem;
        font-weight: 800;
      }
      .dark{
          font-weight: 700;
      }
      /* Create Tweet box */
      .post-tweet {
        background: #fff;
        border-bottom: 10px solid rgb(230, 236, 240);
      }
      .form-group-1 {
        display: flex;
        flex-flow: row;
        padding: 0.3rem 1rem;
      }
      
      .post-tweet img {
        display: inline-block;
        margin-right: 5px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        align-self: center; 
      }
      
      .post-tweet input {
        width: 90%;
        height: 60px;
        padding: 0.5rem 1rem;
        border: none;
        font-size: 1.2rem;
        font-weight: 300;
      }
      .post-tweet input::placeholder {
        color: rgba(123, 124, 126, 0.719);
      }
      .post-tweet input:focus {
        outline: none;
      }
      .form-group-2 {
        display: flex;
        flex-flow: row;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.8rem;
      }
      
      .post-icons {
        padding-left: 4rem;
        color: #1da1f2;
      }
      .post-icons i {
        padding-right: 10px;
        font-size: 1.4rem;
      }
      .form-group-2 .btn {
        border: none;
        font-weight: 600;
        font-size: 1rem;
        padding: 0.7rem 1rem;
        background: #8ed0f9;
        color: #fff;
        border-radius: 25px;
        margin-right: 1rem;
      }
      
      .btn:focus {
        outline: none;
      }
      
      /* User Content */
      .tweets img {
        display: block;
        width: 100%;
        height: 310px;
      }
      .tweets .user-pics img {
        display: block;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin: 0.5rem 1rem;
        object-fit: cover; /* Add this line */
    }
      .tweets {
        display: flex;
        flex-flow: row;
        justify-content: center;
        font-size: 15px;
        width: 100%;
        line-height: 1.75rem;
        padding-top: 0.5rem;
        border-bottom: 1px solid rgb(230, 236, 240);
      }
      .user-content img {
        border-radius: 20px;
      }
      .user-content {
        font-family: "Roboto";
        padding-right: 1rem;
        color: rgb(48, 52, 56);
        font-weight: 400;
        line-height: 1.5;
      }
      .user-content a {
        color: rgb(27, 149, 224);
      }
      
      .user-content-box {
        display: flex;
        flex-flow: column nowrap;
        color: rgb(20, 23, 26);
      }
      
      .user-content-box .user-names {
        display: flex;
        flex-flow: row nowrap;
      }
      .user-names .full-name {
        padding-right: 10px;
        font-size: 1rem;
        font-weight: 700;
        color: rgb(20, 23, 26);
      }
      .user-names .user-name {
        padding-right: 10px;
        font-size: 1.05rem;
        font-weight: 400;
        color: rgb(101, 119, 134);
      }
      .time {
        color: rgb(101, 119, 134);
      }
      .user-names i {
        padding-top: 0.6rem;
        margin-left: 50%;
        color: rgb(101, 119, 134);
      
      }
      .content-icons {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0rem 4rem 1rem 0;
      }
      .sample{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-right: -40px;
          margin-top: 4px;
      }
      .sample i{
          font-size: 20px;
      }
      
      .content-icons i {
        color: rgb(101, 119, 134);
        font-size: 1rem;
        cursor: pointer;
        
      }
      .content-icons i:last-child {
        font-size: 14px;
      }
      
      /* Right Navbar */
      .search-box {
        border: none;
        border-radius: 25px;
        padding: 0.1rem 1rem;
        background: rgb(230, 236, 240);
        margin-top: 0.5rem;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .search-box i {
        color: rgb(101, 119, 134);
        font-size: 0.9rem;
      }
      .search-box input {
        padding: 0.8rem 8rem 0.8rem 0.2rem;
        border-radius: 25px;
        outline: none;
        border: none;
        font-size: 0.9rem;
        background: rgb(230, 236, 240);
      }
      
      /* Trending Nav Items */
      .nav-list {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid rgb(230, 236, 240);
      }
      .nav-list a {
          color: rgb(27, 149, 224);
      }
      .nav-list:last-child {
        font-size: 1rem;
        border-bottom: none;
      }
      .trend-list {
        display: flex;
        flex-flow: column nowrap;
        
      }
      
      .trends {
        background: rgb(245, 248, 250);
        display: flex;
        flex-flow: column nowrap;
        width: 80%;
        border-radius: 15px;
        margin-top: 1rem;
      }
      .trends .header {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.3rem;
        border-bottom: 1px solid rgb(230, 236, 240);
        padding: 0.5rem 1rem;
        border-bottom: 1px solid rgb(230, 236, 240);
      }
      
      .header h2 {
        font-size: 1.2rem;
        font-weight: 800;
      }
      
      .header i {
        color: black;
        background: rgb(245, 248, 250);
        padding: 0.5rem;
        border-radius: 50%
      }
      
      .main-text {
        font-size: 15px;
        font-weight: bold;
        color: rgb(20, 23, 26);
      }
      
      .sub-text {
        font-size: 13px;
        color: rgb(101, 119, 134);
      }
      
      .nav-list .trend-icon {
        font-size: 13px;
        color:  rgb(101, 119, 134);
      }
      
      .right-footer {
        display: flex;
        flex-direction: column;
        width: 80%;
      }
      
      .footer-links {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-start;
        margin-top: 0.5rem;
      }
      .footer-links i {
          padding: 0.4rem;
          border-radius: 50%;
      }
      
      .footer-copyright {
        align-self: flex-start;
      }
      .tweets p{
        font-weight: 500;
        font-size: 17px;
      }
      .follow-users-box {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        font-size: 15px;
        width: 100%;
        line-height: 1.5rem;
      }
      
      .related-followers .sub-text {
        font-size: 14px;
        padding-left: 2.1rem;
      }
      .related-followers i {
        font-size: 0.7rem;
        padding-right: 8px;
      }
      .follow-header .main-text {
        font-size: 19px;
        font-weight: 800;
      }
      .user-name .sub-text {
        font-size: 17px;
        color: rgb(101, 119, 134);
      }
      .follow-header {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid rgb(230, 236, 240);
        border-top: 10px solid rgb(230, 236, 240);
      }
      .mop{
          width: 2rem;
          padding-top: 15px;
      }
      .follow-header i {
        font-size: 13px;
        align-self: center;
        cursor: pointer;
      }
      .navnav{
          width: 1.3rem;
      }
      .navnav2{
          width: 1.1rem;
      }
      .navnav-text{
          display: flex;
          align-items: center;
          gap: 5px;
          color: #567786;
      }
      .navnav3{
          width: 0.9rem;
      }
          </style>
      
        <div class="main-flex-container">
          <div class="left-flex-container flex-item">
            <div class="nav-links">
              <ul>
                <li class="nav-items logo"><a href="#"><svg class="mop" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg></a></li>
                <li class="nav-items current-page"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path  d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg> Home</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M181.3 32.4c17.4 2.9 29.2 19.4 26.3 36.8L197.8 128h95.1l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3s29.2 19.4 26.3 36.8L357.8 128H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H347.1L325.8 320H384c17.7 0 32 14.3 32 32s-14.3 32-32 32H315.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.8-58.7H155.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8L90.2 384H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l21.3-128H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3zM187.1 192L165.8 320h95.1l21.3-128H187.1z"/></svg> Explore</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v25.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm0 96c61.9 0 112 50.1 112 112v25.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V208c0-61.9 50.1-112 112-112zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"/></svg> Notifications</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg> Messages</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"/></svg> Bookmarks</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H512c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H512c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm96 64a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm104 0c0-13.3 10.7-24 24-24H448c13.3 0 24 10.7 24 24s-10.7 24-24 24H224c-13.3 0-24-10.7-24-24zm0 96c0-13.3 10.7-24 24-24H448c13.3 0 24 10.7 24 24s-10.7 24-24 24H224c-13.3 0-24-10.7-24-24zm0 96c0-13.3 10.7-24 24-24H448c13.3 0 24 10.7 24 24s-10.7 24-24 24H224c-13.3 0-24-10.7-24-24zm-72-64a32 32 0 1 1 0-64 32 32 0 1 1 0 64zM96 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg> Lists</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"/></svg> Profile</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg> More</a></li>
              </ul>
            </div>
            <div class="tweet"><a href="#">Post</a></div>
            <div class="profile-box">
            <img src="{{imageSource}}" alt="">
              <div class="profile-link">
                <p class="full-name">{{nameSrc}}</p>
                <p class="user-name">@{{usernameSrc}}</p>
              </div>
              <div class="options-icon"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg></div>
            </div>
          </div>
      
          <div class="center-flex-container flex-item">
            <div class="home">
              <p class="dark underline">For you</p>
              <p>Following</p>
            </div>
      
            <div class="post-tweet">
            </div>
            <!-- User Content -->
              <div class="tweets">
                <div class="user-pics"> <img src="{{imageSource}}" alt=""></div>
                <div class="user-content-box">
                  <div class="user-names">
                    <hi class="full-name">{{nameSrc}}</hi>
                    <p class="user-name">@{{usernameSrc}}</p>
                    <p class="time"> . 2hrs</p>
                  </div>
                  
                  <div class="user-content">
                    <p>These creatures’ furs make for great coats! The first one was not yet mature enough so I had to let him go unfortunately. Such a shame. I may not soon meet a beast with such thick coat.  Good news is I took one big guy down. Efforts pay off peeps!        <a href="#">#monthlyHunt</a> <a href="#">#hobby</a> <a href="#">#hunting</a></p>
                    <img src="http://tattlingelk.com:3000/images/9.png" alt="content1"><!--https://i.postimg.cc/ZYGFKvDJ/IMG-20240520-WA0019.jpg-->
                  </div>
        
                  <div class="content-icons">
                      <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z"/></svg>273</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M272 416c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32-14.3-32-32V192h32c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-64-64c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l32 0 0 128c0 53 43 96 96 96H272zM304 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32 14.3 32 32l0 128H416c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8l-32 0V192c0-53-43-96-96-96L304 96z"/></svg>2k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>1k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z"/></svg>1m</p>
                    <div class="sample">
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"/></svg></p>
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></p>
                  </div>
                  </div>
        
                </div>
              </div>
      
              <div class="tweets">
                <div class="user-pics"> <img src="https://i.postimg.cc/qvN19fbg/irene-strong-v2a-Knj-Mb-P-k-unsplash.jpg" alt=""></div>
                <div class="user-content-box">
                  <div class="user-names">
                    <hi class="full-name">The DilDozer</hi>
                    <p class="user-name">@TheDilDozer</p>
                    <p class="time"> . 4hrs</p>
                  </div>
                  
                  <div class="user-content">
                    <p>There's no clear correlation between your background and what you are going to achieve in life..</p>
                  </div>
      
                  <div class="content-icons">
                      <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z"/></svg>273</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M272 416c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32-14.3-32-32V192h32c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-64-64c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l32 0 0 128c0 53 43 96 96 96H272zM304 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32 14.3 32 32l0 128H416c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8l-32 0V192c0-53-43-96-96-96L304 96z"/></svg>2k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>1k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z"/></svg>1m</p>
                    <div class="sample">
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"/></svg></p>
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></p>
                  </div>
                  </div>
        
                </div>
              </div>
      
              <section class="follow-users-box">
      
                <div class="follow-header">
                  <h1 class="main-text">Who to follow</h1>
                  <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                </div>
              </section>
          </div>
      
          
      
          <div class="right-flex-container flex-item">
            <div class="search-box">
              <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
              <input type="text" placeholder="Search Twitter">
            </div>
      
            <div class="trends">
              <ul>
                <li class="nav-list header">
                  <h2>Trends for you</h2>
                  <svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="black" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Eindhoven</p>
                    <p class="sub-text">274K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Shrek</p>
                    <p class="sub-text">154K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Netflix</p>
                    <p class="sub-text">135K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Dora</p>
                    <p class="sub-text">124K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#TGIF</p>
                    <p class="sub-text">43K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                
                
                <li class="nav-list"><a href="#">Show more</a></li>
              </ul>
            </div>
      
            <div class="right-footer">
              <div class="footer-links">
                <a href="#" class="sub-text">Terms</a>
                <a href="#" class="sub-text">Privacy policy</a>
                <a href="#" class="sub-text">Ads info</a>
                <a href="#" class="sub-text">more</a>
                <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
              </div>
              <div class="footer-copyright">
                <p class="sub-text">&copy; 2024 X, Inc.</p>
              </div>
      
            </div>
          
          </div>
          
        </div>
        
      </body>
      </html>
      `
  });
  
  console.log('Image4 successfully created.');

  bucket.upload(image4FilePath, {destination: `images/${image4FileName}`});

  console.log(`Uploading to firebase complete for image ${image4FileName}`);
  
  
}

 
// Initialize the ApifyClient with your Apify API token
const client = new ApifyClient({
    //token: 'apify_api_f1RLwIlsOobQIM2Cm2Vg2giVs938Ec4gukzH' //API token from apify
    token: ApifyKey
    ,
});
const options = {
  memory: 8192, // 8 GB of RAM to make it run faster
};
// Prepare Actor input
var input//Var used for input
if (req.body.gender == "male") {//check the gender of the person based on scan
  console.log("Male profile has been selected for the deepfakes"); //Logs which profile is being used for debugging
  input = {//set input links for male
    "face_url": [ //Url to the face being scanned
        Domain + "/images/1.png"
    ],//Deepfake images for males
    "base_url": [
        "https://tattlingelk.com/2.png",
        "https://tattlingelk.com/hunter.jpg",
        "https://tattlingelk.com/REPORT-PHOTO.PNG",
        "https://elements-video-cover-images-0.imgix.net/files/29e64274-457a-4ef5-95c0-a12aa371dd11/inline_image_preview.jpg?auto=compress&h=800&w=1200&fit=crop&crop=edges&fm=jpeg&s=6731a06c82f602ff6fbb585677c94411", 
        "https://s3.envato.com/files/388507293/298846720.jpg", 
        "https://as2.ftcdn.net/v2/jpg/04/42/54/69/1000_F_442546992_s8EYhgEax0aBlNtifQhVk6xHH23xI60A.jpg" //Added more embarassing moment/s     
      ]
};
}
else {//If not Male then it defaults to female
  console.log("Female profile has been selected for the deepfakes"); //Logs which profile is being used for debugging
  input = {
    "face_url": [ //Url to the face being scanned
        Domain + "/images/1.png"
    ],//Deepfake images for females
    "base_url": [
        "https://tattlingelk.com/2.png",
        "https://www.discountafricanhunts.com/uploads/dah164149391655431.jpg",
        "https://cdn.abcotvs.com/dip/images/11694883_033022-wls-rosemont-suspect-arrest-10vo-vid.jpg",
        "https://elements-video-cover-images-0.imgix.net/files/29e64274-457a-4ef5-95c0-a12aa371dd11/inline_image_preview.jpg?auto=compress&h=800&w=1200&fit=crop&crop=edges&fm=jpeg&s=6731a06c82f602ff6fbb585677c94411", 
        "https://i0.wp.com/jonathanturley.org/wp-content/uploads/2016/08/giraffe-girl.jpg?ssl=1", 
        "https://pbs.twimg.com/media/GH_yZ2tWgAAxv3m.jpg" //Added more embarassing moment/s     
      ]
};

}

// https://tattlingelk.com/hunter.jpg
// https://tattlingelk.com/REPORT-PHOTO.PNG
// https://elements-video-cover-images-0.imgix.net/files/29e64274-457a-4ef5-95c0-a12aa371dd11/inline_image_preview.jpg?auto=compress&h=800&w=1200&fit=crop&crop=edges&fm=jpeg&s=6731a06c82f602ff6fbb585677c94411
// https://s3.envato.com/files/388507293/298846720.jpg
// https://as2.ftcdn.net/v2/jpg/04/42/54/69/1000_F_442546992_s8EYhgEax0aBlNtifQhVk6xHH23xI60A.jpg

(async () => {

    // Run the deepfake API through the Apify platform
    const run = await client.actor("jupri/faceswapify").call(input, options);//Run the deepfake script using the input and options.
    // Fetch and print Actor results from the run's dataset (if any)
    console.log('Results from dataset');//Log the dataset results
    console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();


    items.forEach((item) => {//For each item in the dataset from the deepfake execute the code below
      var download = function(uri, filename, callback){
        request.head(uri, function(err, res, body){    
          request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
      };
      download(item.file, './images/' + imagecount + '.png', function(){});
      console.log('Downloaded and saved '+ imagecount + '.png to images folder');
      setTimeout(() => {//Set timeout here to prevent firebase from uploading images that are not yet downloaded.
        bucket.upload(path.join(__dirname, 'images', firebasecounter + '.png'), { destination: `images/${imagecount}` + '.png' }, (error, file) => {//Upload image to firebase
          if (error) {//Incase of error catch the error to prevent a fatal crash from occuring.
            console.error('Error uploading to Firebase:', error);//Log the error
            firebasecounter++//Increase the count to not break everything else in the code
          } else {
            console.log('Uploading to firebase complete for image ' + firebasecounter + '.png');//Incase of no error, log that the upload was successfull
            firebasecounter++//Increase variable to keep the for each loop working properly
          }
        });
      }, 1000); // Wait for 1 second (1000 milliseconds)
      imagecount++;//Increase imagecount by 1 so it downloads the next image without overwriting the old one.
      if (firebasecounter===10){//If the firebase uploader has uploaded image 9.png, run the TwitterProfileImage creator code
        // create the twitter profile with hunter deepfake
        createTwitterProfileImage(profilepic, username, fullName, image4FilePath, image4FileName);
      }
    });
})();



  // Upload new image to Firebase Storage
  bucket.upload(imgFilePath, { destination: `images/${imgFileName}` })
  .then(() => {
    console.log('New image successfully uploaded to Firebase Storage.');

    return nodeHtmlToImage({
      content: { imageSource: profilepic, agescanner: ScannerAge, mood: MoodResponse },//set the imageSource to the profilepic var
      output: image2FilePath,
      html:  `
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css?family=Asap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
          <style>
            body {
              background: #e6ecf0;
              width: 854px;
              height: 480px;
              font-family: 'Asap', sans-serif;
              font-family: 'Roboto', sans-serif;
            
            }
            img {
              max-width:100%;
            }
            .avator {
              border-radius:100px;
              width:48px;
              margin-right: 15px;
              object-fit: cover;
              width: 48px;
              height: 48px;
            }
            
            
            .tweet-wrap {
              max-width:490px;
              background: #fff;
              margin: 0 auto;
              margin-top: 50px;
              border-radius:3px;
              padding: 30px;
              border-bottom: 1px solid #e6ecf0;
              border-top: 1px solid #e6ecf0;
            }
            
            .tweet-header {
              display: flex;
              align-items:flex-start;
              font-size:14px;
            }
            .tweet-header-info {
              font-weight:bold;
            }
            .tweet-header-info span {
              color:#657786;
              font-weight:normal;
              margin-left: 5px;
            }
            .tweet-header-info p {
              font-weight:normal;
              margin-top: 5px;
              
            }
            .tweet-img-wrap {
              padding-left: 60px;
            }
            
            .tweet-info-counts {
              display: flex;
              margin-left: 60px;
              margin-top: 10px;
            }
            .tweet-info-counts div {
              display: flex;
              margin-right: 20px;
            }
            .tweet-info-counts div svg {
              color:#657786;
              margin-right: 10px;
            }
            @media screen and (max-width:430px){
              body {
                padding-left: 20px;
                padding-right: 20px;
              }
              .tweet-header {
                flex-direction:column;
              }
              .tweet-header img {
                margin-bottom: 20px;
              }
              .tweet-header-info p {
                margin-bottom: 30px;
              }
              .tweet-img-wrap {
                padding-left: 0;
              }
              .tweet-info-counts {
              display: flex;
              margin-left: 0;
            }
            .tweet-info-counts div {
              margin-right: 10px;
            }
            }
          </style>
        </head>
        <body>            
        <div class="tweet-wrap">
          <div class="tweet-header">
          <img src="{{imageSource}}" alt="" class="avator">
            <div class="tweet-header-info">
              Steve Schoger <span>@Steve Schoger</span><span>. Jun 27
        </span> <!-- THESE TWEETS DO NOT REFLECT OUR FEELINGS OR OPINIONS WHATSOEVER, just putting it out there -->
              <p>I am {{agescanner}} years old and {{mood}} </p>
              
            </div>
            
          </div>
          <div class="tweet-img-wrap">
            <img src="https://tattlingelk.com/paragon.png" alt="" class="tweet-img">
          </div>
          <div class="tweet-info-counts">
            
            <div class="comments">
              
              <svg class="feather feather-message-circle sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <div class="comment-count">33</div>
            </div>
            
            <div class="retweets">
              <svg class="feather feather-repeat sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
              <div class="retweet-count">397</div>
            </div>
            
            <div class="likes">
              <svg class="feather feather-heart sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <div class="likes-count">
                2.6k
              </div>
            </div>
            
            <div class="message">
              <svg class="feather feather-send sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </div>
          </div>
        </div>
        </body>
      </html>

    `
    });
  })
  .then(() => {
    console.log('Image2 successfully created.');

    // Upload image2 to Firebase Storage
    return bucket.upload(image2FilePath, { destination: `images/${image2FileName}` });
  })
  .then(() => {
    console.log('Image2 successfully uploaded to Firebase Storage.');
    
    // create a png from an html template with nodeHtmlToImage
    return nodeHtmlToImage({
      content: { imageSource: profilepic, filterSource: filterImgDataURI, firstNameSrc: firstName, usernameSrc: username },//set the imageSource to the profilepic var
      output: image3FilePath,
      html:`
      <html>
      <head>
      <style>
        *{
          box-sizing: border-box;
          font-family: sans-serif;
        }
        body{
            margin: 0;
            display: flex;
            width: 1536px;
            height: 671px;
        }
        /*------------------*/
        /*reel video section*/
        section.post-content{
            width: 66%;
            color: white;
            background-color: black;
            height: 100%;
            display: flex;
            justify-content: center;
            position: relative;
        }
        .m-size-icon{
            width: 30px; /*class used for icons for closing reel, scrolling between reels*/
        }
        span.icon-shadow{
            background-color: #343030;
            border-radius: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: min-content;
        }
        span.play-btn{
            top: 40%;
            left: 50%;
            position: absolute;
        }
        span.play-btn img{
            width: 70px; 
        }
        span.report svg{
            width: 11px; /*flag icon in the button for reporting the reel*/
            margin-right: 12px;
        }
        span.close-post{
            left: 20px;
            top: 20px;
            padding: 7px;
        }
        span.report{
            right: 20px;
            top: 20px;
            padding-block: 12px;
            padding-inline: 20px;
        }
        /*reel video*/
        figure.reel-container{
            height: 100vh;
            width: 500px;
            position: relative; /*allow the play btn to be centered easily*/
            margin: 0;
        }
        section.post-content>span, section.post-content>div{
            position: absolute;
        }
        figure.reel-container>img{
            object-fit: cover;
            width: 100%;
            height: 100%;
        }
        /*reel video progress*/
        .reel-progress{
            display: flex;
            gap: 20px;
            bottom: 40px;
            position: absolute;
            left: 20px;
            align-items: center;
        }
        .slider-time{ /*the progress bar for tracking time*/
            width: 360px;
            height: 8px;
            background-color: rgba(255, 255, 255, 0.4);
            position: relative;
            border-radius: 5px;
        }
        .time-passed{ /*the bar for amount of time passed*/
            height: 100%;
            width: 85%;
            position: absolute;
            left: 0;
            background-color: white;
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
        }
        /*scroller for reels*/
        .reel-scroller{
            display: flex;
            flex-direction: column;
            right: 20px;
            top: calc(50% - 50px);
        }
        .previous-reel, .next-reel{
            width: fit-content;
            padding: 7px;
            margin-bottom: 20px;
        }
        span.previous-reel{
            transform: rotate(270deg);
        }
        span.next-reel{
            transform: rotate(90deg);
        }
        
        /*------------------*/
        /*reel video information section*/
        section.reel-details{
            width: 34%;
            padding: 20px;
        }
        /*reel author section - user information and reel description*/
        .reel-author-container{
            background-color: #f8f8f8;
            border-radius: 15px;
            padding-inline: 20px;
            padding-block: 15px;
            margin-bottom: 1rem;
        }
        .user-main-details-container{
            display: flex;
            justify-content: space-between;
        }
        .user-main-details{
            display: flex;
            gap: 15px;
        }
        .user-main-details>figure.reel-author-profile-pic, figure.comment-author-profile-pic{
            max-width: 45px;
            height: 45px;
            margin: 0;
        }
        .user-main-details>figure.reel-author-profile-pic>img, figure.comment-author-profile-pic>img{
            object-fit: cover;
            width: 100%;
            height: 100%;
            border-radius: 50%; /*make the profile picture icon circular*/
        }
        .reel-author-details-container{ /*username container*/
            display: flex;
            flex-direction: column;
        }
        span.author-username{
            font-weight: 700;
            font-size: 18px;
        }
        span.author-name{
            font-size: 15px;
        }
        button.follow-btn{
            border-radius: 3px;
            color: white;
            background-color: #fe2b54ff;
            color: white;
            border: 0;
            width: 100px;
            height: 40px;
            font-size: 16px;
        }
        p.reel-description{
            line-height: 1.3rem;
        }
        span.hashtags{
            color: #375e9fff;
            font-weight: 600;
        }
        .reel-music{
            display: flex;
            gap: 10px;
        }
        span.music-icon>svg{
            width: 14px;
        }
        span.music-name{
            font-size: 15px;
        }
        .post-engagement{
            display: flex;
            gap: 12px;
            margin-bottom: 1rem;
        }
        /*share reel options*/
        span.engagement-icon-container{
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background-color: #f8f8f8;
            display: flex; /*center the icon inside the span*/
            justify-content: center;
            align-items: center;
        }
        span.engagement-icon-container>svg{
            width: 23px;
        }
        span.engagement-count{
            align-self: center;
            color: #555459;
            font-weight: 600;
            font-size: 13px;
        }
        .post-engagement-option{
            display: flex;
            gap: 5px;
        }
        .post-engagement-option:nth-of-type(2) svg{
            width: 20px;
            height: 20px;
        }
        span.share-option{
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex; /*center the icon inside the span*/
            justify-content: center;
            align-items: center;
        }
        span.share-option:first-of-type{
            margin-left: 10px;
        }
        span.share-option:nth-of-type(1){
            background-color: rgb(80, 80, 80);
        }
        span.share-option:nth-of-type(2){
            background-color: #fe2b54ff;
        }
        span.share-option:nth-of-type(3)>svg,
        span.share-option:nth-of-type(4)>svg,
        span.share-option:nth-of-type(5)>svg{
            width: 25px;
            height: 25px;
        }
        span.share-option>svg, span.forward-option>svg{
            width: 18px;
        }
        span.forward-option, span.share-option{
            align-self: center;
        }
        /*copy reel link*/
        .link-to-reel{
            background-color: #f1f1f3;
            border: 1px solid #e9e9eb;
            padding: 6px;
            border-radius: 10px;
            display: flex;
            justify-content: space-around;
            margin-bottom: 0.875rem;
        }
        .link-url{
            color: #56555b;
        }
        span.copy-link{
            font-weight: 600;
            font-size: 15px;
        }
        /*user comments*/
        .comments-tabs{
            width: 100%;
            border-bottom: 1px solid #e1e1e1;
            display: flex;
            margin-bottom: 1rem;
        }
        .comments-tabs>span{
            width: 50%;
            font-weight: 600;
            position: relative;
            display: flex;
            justify-content: center;
            padding: 10px;
        }
        span.comments-tab::before{ /*the black line indicating the active tab*/
            content: "";
            width: 100%;
            height: 2px;
            position: absolute;
            bottom: 0;
            border-radius: 2px;
            background-color: black;
        }
        span.creator-vids-tab{
            color: #7b7b7b;
        }
        .user-comment{ 
            display: flex;
            justify-content: space-between;
            margin-bottom: 1.2rem;
        }
        .comment-main-details{
            display: flex;
            gap: 1rem;
        }
        .comment-content-container{ 
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        span.comment-author-name{
            font-weight: 600;
        }
        .comment-details{
            display: flex;
            margin-top: 2px;
            font-size: 15px;
            gap: 30px;
        }
        .comment-details>span{
            color: #7b7b7b;
            font-size: 15px;
        }
        span.comment-content{
            line-height: 1.3rem;
        }
        span.view-replies{
            color: #7b7b7b;
            margin-top: 4px;
            font-weight: 600;
            display: flex;
            gap: 10px;
        }
        span.view-replies>svg{
            width: 7px;
            transform: rotate(90deg);
            align-self: center;
        }
        .comment-likes-container{ /*container for the likes on each comment*/
            display: flex;
            flex-direction: column;
            align-self: center;
        }
        span.comment-likes>svg{
            width: 25px;
        }
        span.number-comment-likes{
            color: #7b7b7b;
            font-weight: 600;
            text-align: center;
        }
        /*write your own comment section*/
        .write-a-comment{
            border-top: 2px solid #e1e1e1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .write-a-comment>input{
            border-radius: 2px;
            background-color: #f1f1f1;
            font-family: sans-serif;
            border: 0;
            width: 400px;
            height: 40px;
            margin-top: 9px;
            font-size: 16px;
            padding: 15px;
        }
      </style>
      </head>
      <body>
          <section class="post-content">
              <span class="close-post icon-shadow"><svg viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" class="m-size-icon"><path d="M5.3 18.7c.2.2.4.3.7.3s.5-.1.7-.3l5.3-5.3 5.3 5.3c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4L13.4 12l5.3-5.3c.4-.4.4-1 0-1.4s-1-.4-1.4 0L12 10.6 6.7 5.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l5.3 5.3-5.3 5.3c-.4.4-.4 1 0 1.4z" id="_icons" fill="#ffffff" class="fill-000000"></path></svg></span>
              <figure class="reel-container">
                  <!--PUT THE DEEPFAKE/FILTERED SCREENSHOT HERE-->
                  <img src="{{filterSource}}" alt="">
                  <span class="play-btn"><svg viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 512 512"><path d="M405.2 232.9 126.8 67.2c-3.4-2-6.9-3.2-10.9-3.2-10.9 0-19.8 9-19.8 20H96v344h.1c0 11 8.9 20 19.8 20 4.1 0 7.5-1.4 11.2-3.4l278.1-165.5c6.6-5.5 10.8-13.8 10.8-23.1s-4.2-17.5-10.8-23.1z" fill="#ffffff" class="fill-000000"></path></svg></span>
                  <!--The white progress for tracking the length of the reel video-->
                  <div class="reel-progress">
                      <div class="slider-time">
                          <div class="time-passed"></div>
                      </div>
                      <span class="time-passed-seconds">00:12/00:13</span>
                  </div>
              </figure>
              
              <span class="report icon-shadow"><svg class="feather feather-flag" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"></path></svg>Report</span>
              <div class="reel-scroller">
                  <span class="previous-reel icon-shadow"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" class="m-size-icon"><path d="M202.1 450a15 15 0 0 1-10.6-25.61L365.79 250.1 191.5 75.81a15 15 0 0 1 21.21-21.21l184.9 184.9a15 15 0 0 1 0 21.21l-184.9 184.9A15 15 0 0 1 202.1 450Z" data-name="1" fill="#ffffff" class="fill-000000"></path></svg></span>
                  <span class="next-reel icon-shadow"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" class="m-size-icon"><path d="M202.1 450a15 15 0 0 1-10.6-25.61L365.79 250.1 191.5 75.81a15 15 0 0 1 21.21-21.21l184.9 184.9a15 15 0 0 1 0 21.21l-184.9 184.9A15 15 0 0 1 202.1 450Z" data-name="1" fill="#ffffff" class="fill-000000"></path></svg></span>
              </div>
          </section>
      
          <section class="reel-details">
              <div class="reel-author-container">
                  <div class="user-main-details-container">
                      <div class="user-main-details">
                          <figure class="reel-author-profile-pic">
                              <!--PUT THE PROFILE PICTURE OF THE USER HERE-->
                              <img src="{{imageSource}}" alt="">
                          </figure>
                          <div class="reel-author-details-container">
                              <!--USERNAME OF USER-->
                              <span class="author-username">{{usernameSrc}}</span>
                              <!--NAME OF USER-->
                              <span class="author-name">{{firstNameSrc}}</span>
                          </div>
                      </div>
                      <button class="follow-btn">Follow</button>
                  </div>
                  <p class="reel-description">When you feel your best, you look your best. Confidence looks good on me, don't you think? &#128521;<span class="hashtags">#goodvibes #unapologetic #empowered #unstoppable</span></p>
                  <div class="reel-music">
                      <span class="music-icon"><?xml version="1.0" ?><svg class="bi bi-music-note-beamed" fill="currentColor" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/><path d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" fill-rule="evenodd"/><path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"/></svg></span>
                      <span class="music-name">original sound - Tomorrowland</span>
                  </div>
              </div>
              <div class="post-engagement">   
                  <!--Like, comment and save options-->
                  <div class="post-engagement-option">
                      <span class="engagement-icon-container"><?xml version="1.0" ?><svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256"/><path d="M176,32a60,60,0,0,0-48,24A60,60,0,0,0,20,92c0,71.9,99.9,128.6,104.1,131a7.8,7.8,0,0,0,3.9,1,7.6,7.6,0,0,0,3.9-1,314.3,314.3,0,0,0,51.5-37.6C218.3,154,236,122.6,236,92A60,60,0,0,0,176,32Z"/></svg></span>
                      <span class="engagement-count">191.7K</span>
                  </div>
                  <div class="post-engagement-option">
                      <span class="engagement-icon-container"><?xml version="1.0" ?><svg fill="none" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><path d="M422.88 89.1257C389.875 56.12 347.825 33.6425 302.045 24.5356C256.266 15.4287 208.814 20.1014 165.691 37.9629C122.567 55.8244 85.7082 86.0725 59.7755 124.882C33.8428 163.691 20.0009 209.319 20 255.996V452.666C20 463.097 24.1437 473.1 31.5195 480.476C38.8953 487.852 48.899 491.996 59.33 491.996H256C302.675 491.995 348.302 478.154 387.111 452.222C425.92 426.291 456.168 389.434 474.03 346.312C491.892 303.19 496.567 255.739 487.462 209.961C478.358 164.182 455.883 122.131 422.88 89.1257V89.1257ZM165.81 283.816C159.375 290.252 150.907 294.258 141.85 295.151C132.792 296.044 123.705 293.768 116.137 288.713C108.569 283.657 102.988 276.133 100.345 267.424C97.7022 258.715 98.1609 249.359 101.643 240.95C105.125 232.541 111.415 225.599 119.441 221.308C127.468 217.017 136.734 215.641 145.66 217.416C154.587 219.19 162.622 224.005 168.397 231.04C174.172 238.075 177.329 246.894 177.33 255.996C177.33 266.43 173.187 276.436 165.81 283.816V283.816ZM283.81 283.816C277.375 290.252 268.907 294.258 259.85 295.151C250.792 296.044 241.705 293.768 234.137 288.713C226.569 283.657 220.988 276.133 218.345 267.424C215.702 258.715 216.161 249.359 219.643 240.95C223.125 232.541 229.415 225.599 237.441 221.308C245.468 217.017 254.734 215.641 263.66 217.416C272.587 219.19 280.622 224.005 286.397 231.04C292.172 238.075 295.329 246.894 295.33 255.996C295.33 266.43 291.187 276.436 283.81 283.816V283.816ZM401.81 283.816C395.375 290.252 386.907 294.258 377.85 295.151C368.792 296.044 359.705 293.768 352.137 288.713C344.569 283.657 338.988 276.133 336.345 267.424C333.702 258.715 334.161 249.359 337.643 240.95C341.125 232.541 347.415 225.599 355.441 221.308C363.468 217.017 372.734 215.641 381.66 217.416C390.587 219.19 398.622 224.005 404.397 231.04C410.172 238.075 413.329 246.894 413.33 255.996C413.33 266.43 409.187 276.436 401.81 283.816V283.816Z" fill="black"/></svg></span>
                      <span class="engagement-count">9568</span>
                  </div>
                  <div class="post-engagement-option">
                      <span class="engagement-icon-container"><?xml version="1.0" ?><svg height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M34 6H14c-2.21 0-3.98 1.79-3.98 4L10 42l14-6 14 6V10c0-2.21-1.79-4-4-4z"/><path d="M0 0h48v48H0z" fill="none"/></svg></span>
                      <span class="engagement-count">25.9K</span>
                  </div>  
                  <!--Share with external social media options-->
                  <span class="share-option"><svg viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg"><path d="M416 31.94C416 21.75 408.1 0 384.1 0c-13.98 0-26.87 9.072-30.89 23.18l-128 448a31.933 31.933 0 0 0-1.241 8.801C223.1 490.3 232 512 256 512c13.92 0 26.73-9.157 30.75-23.22l128-448c.85-2.97 1.25-5.93 1.25-8.84zM176 143.1c0-18.28-14.95-32-32-32-8.188 0-16.38 3.125-22.62 9.376l-112 112C3.125 239.6 0 247.8 0 255.1s3.125 17.3 9.375 23.5l112 112c6.225 6.3 14.425 8.5 22.625 8.5 17.05 0 32-13.73 32-32 0-8.188-3.125-16.38-9.375-22.63L77.25 255.1l89.38-89.38c6.27-5.42 9.37-13.52 9.37-22.62zm464 112c0-8.188-3.125-16.38-9.375-22.63l-112-112C512.4 115.1 504.2 111.1 496 111.1c-17.05 0-32 13.73-32 32 0 8.188 3.125 16.38 9.375 22.63l89.38 89.38-89.38 89.38C467.1 351.6 464 359.8 464 367.1c0 18.28 14.95 32 32 32 8.188 0 16.38-3.125 22.62-9.376l112-112C636.9 272.4 640 264.2 640 255.1z" fill="#ffffff" class="fill-000000"></path></svg></span>
                  <span class="share-option"><svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.815 12.197-7.532 1.256a.5.5 0 0 0-.386.318L2.3 20.728c-.248.64.421 1.25 1.035.943l18-9a.75.75 0 0 0 0-1.342l-18-9c-.614-.307-1.283.304-1.035.943l2.598 6.957a.5.5 0 0 0 .386.319l7.532 1.255a.2.2 0 0 1 0 .394Z" fill="#ffffff" class="fill-212121"></path></svg></span>
                  <span class="share-option"><?xml version="1.0" ?><svg id="Layer_1" style="enable-background:new 0 0 1000 1000;" version="1.1" viewBox="0 0 1000 1000" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style type="text/css">
                  .st0{fill:#25D366;}
                  .st1{fill-rule:evenodd;clip-rule:evenodd;fill:#FFFFFF;}
                </style><title/><g><path class="st0" d="M500,1000L500,1000C223.9,1000,0,776.1,0,500v0C0,223.9,223.9,0,500,0h0c276.1,0,500,223.9,500,500v0   C1000,776.1,776.1,1000,500,1000z"/><g><g id="WA_Logo"><g><path class="st1" d="M733.9,267.2c-62-62.1-144.6-96.3-232.5-96.4c-181.1,0-328.6,147.4-328.6,328.6      c0,57.9,15.1,114.5,43.9,164.3L170.1,834l174.2-45.7c48,26.2,102,40,157,40h0.1c0,0,0,0,0,0c181.1,0,328.5-147.4,328.6-328.6      C830.1,411.9,796,329.3,733.9,267.2z M501.5,772.8h-0.1c-49,0-97.1-13.2-139-38.1l-10-5.9L249,755.9l27.6-100.8l-6.5-10.3      c-27.3-43.5-41.8-93.7-41.8-145.4c0.1-150.6,122.6-273.1,273.3-273.1c73,0,141.5,28.5,193.1,80.1c51.6,51.6,80,120.3,79.9,193.2      C774.6,650.3,652,772.8,501.5,772.8z M651.3,568.2c-8.2-4.1-48.6-24-56.1-26.7c-7.5-2.7-13-4.1-18.5,4.1      c-5.5,8.2-21.2,26.7-26,32.2c-4.8,5.5-9.6,6.2-17.8,2.1c-8.2-4.1-34.7-12.8-66-40.8c-24.4-21.8-40.9-48.7-45.7-56.9      c-4.8-8.2-0.5-12.7,3.6-16.8c3.7-3.7,8.2-9.6,12.3-14.4c4.1-4.8,5.5-8.2,8.2-13.7c2.7-5.5,1.4-10.3-0.7-14.4      c-2.1-4.1-18.5-44.5-25.3-61c-6.7-16-13.4-13.8-18.5-14.1c-4.8-0.2-10.3-0.3-15.7-0.3c-5.5,0-14.4,2.1-21.9,10.3      c-7.5,8.2-28.7,28.1-28.7,68.5c0,40.4,29.4,79.5,33.5,84.9c4.1,5.5,57.9,88.4,140.3,124c19.6,8.5,34.9,13.5,46.8,17.3      c19.7,6.3,37.6,5.4,51.7,3.3c15.8-2.4,48.6-19.9,55.4-39c6.8-19.2,6.8-35.6,4.8-39C665,574.4,659.5,572.4,651.3,568.2z"/></g></g></g></g></svg></span>
                  <span class="share-option"><?xml version="1.0" ?><svg id="Layer_1" style="enable-background:new 0 0 1000 1000;" version="1.1" viewBox="0 0 1000 1000" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style type="text/css">
                  .st0{fill:#3B579D;}
                  .st1{fill:#FFFFFF;}
                </style><title/><g><path class="st0" d="M500,1000L500,1000C223.9,1000,0,776.1,0,500v0C0,223.9,223.9,0,500,0h0c276.1,0,500,223.9,500,500v0   C1000,776.1,776.1,1000,500,1000z"/><path class="st1" d="M630,1000V612.7h130l19.5-150.9H630v-96.4c0-43.7,12.1-73.5,74.8-73.5l79.9,0V157   c-13.8-1.8-61.3-5.9-116.5-5.9c-115.2,0-194.1,70.3-194.1,199.5v111.3H343.8v150.9h130.3V1000H630z" id="f"/></g></svg></span>
                  <span class="share-option"><?xml version="1.0" ?><!DOCTYPE svg  PUBLIC '-//W3C//DTD SVG 1.1//EN'  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'><svg enable-background="new 0 0 48 48" id="Layer_1" version="1.1" viewBox="0 0 48 48" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle cx="24" cy="24" fill="#1CB7EB" r="24"/><g><g><path d="M36.8,15.4c-0.9,0.5-2,0.8-3,0.9c1.1-0.7,1.9-1.8,2.3-3.1c-1,0.6-2.1,1.1-3.4,1.4c-1-1.1-2.3-1.8-3.8-1.8    c-2.9,0-5.3,2.5-5.3,5.7c0,0.4,0,0.9,0.1,1.3c-4.4-0.2-8.3-2.5-10.9-5.9c-0.5,0.8-0.7,1.8-0.7,2.9c0,2,0.9,3.7,2.3,4.7    c-0.9,0-1.7-0.3-2.4-0.7c0,0,0,0.1,0,0.1c0,2.7,1.8,5,4.2,5.6c-0.4,0.1-0.9,0.2-1.4,0.2c-0.3,0-0.7,0-1-0.1    c0.7,2.3,2.6,3.9,4.9,3.9c-1.8,1.5-4.1,2.4-6.5,2.4c-0.4,0-0.8,0-1.3-0.1c2.3,1.6,5.1,2.6,8.1,2.6c9.7,0,15-8.6,15-16.1    c0-0.2,0-0.5,0-0.7C35.2,17.6,36.1,16.6,36.8,15.4z" fill="#FFFFFF"/></g></g></svg></span>
                  <span class="forward-option"><?xml version="1.0" ?><svg style="enable-background:new 0 0 24 24;" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="info"/><g id="icons"><path d="M21.7,10.2l-6.6-6C14.6,3.7,14,4.2,14,5v3c-4.7,0-8.7,2.9-10.6,6.8c-0.7,1.3-1.1,2.7-1.4,4.1   c-0.2,1,1.3,1.5,1.9,0.6C6.1,16,9.8,13.7,14,13.7V17c0,0.8,0.6,1.3,1.1,0.8l6.6-6C22.1,11.4,22.1,10.6,21.7,10.2z" id="share"/></g></svg></span>
              </div>
              <div class="link-to-reel">
                  <span class="link-url">https://www.tiktok.com/video/7178236128481</span>
                  <span class="copy-link">Copy link</span>
              </div>
      
              <!--Reel comments-->
              <!--Comments tabs-->
              <div class="comments-tabs">
                  <span class="comments-tab">Comments(9363)</span>
                  <span class="creator-vids-tab">Creator videos</span>
              </div>
              <div class="user-comments">
                  <div class="user-comment">
                      <div class="comment-main-details">
                          <figure class="comment-author-profile-pic">
                              <!--photo by Christian Buehner on Unsplash-->
                              <img src="https://images.unsplash.com/photo-1623930154261-37f8b293c059?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="">
                          </figure>
                          <div class="comment-content-container">
                              <span class="comment-author-name">Pedro</span>
                              <span class="comment-content">Hahahaha have you ever looked at the mirror?? You should be ashamed.</span>
                              <div class="comment-details">
                                  <span>1w ago</span>
                                  <span>Reply</span>
                              </div>
                              <span class="view-replies">View 4 replies <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M202.1 450a15 15 0 0 1-10.6-25.61L365.79 250.1 191.5 75.81a15 15 0 0 1 21.21-21.21l184.9 184.9a15 15 0 0 1 0 21.21l-184.9 184.9A15 15 0 0 1 202.1 450Z" data-name="1" fill="#7b7b7b" class="fill-000000"></path></svg></span>
                          </div>
                      </div>
                      <div class="comment-likes-container">
                          <span class="comment-likes"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z" fill="#7b7b7b" class="fill-000000"></path></svg></span>
                          <span class="number-comment-likes">34</span>
                      </div> 
                  </div>
                  <div class="user-comment">
                      <div class="comment-main-details">
                          <figure class="comment-author-profile-pic">
                              <!--Photo by Nicolas Horn on Unsplash-->
                              <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="">
                          </figure>
                          <div class="comment-content-container">
                              <span class="comment-author-name">Juan</span>
                              <span class="comment-content">Yikes &#129326; &#129326; &#129326;</span>
                              <div class="comment-details">
                                  <span>5 days ago</span>
                                  <span>Reply</span>
                              </div>
                              <span class="view-replies">View 2 replies <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M202.1 450a15 15 0 0 1-10.6-25.61L365.79 250.1 191.5 75.81a15 15 0 0 1 21.21-21.21l184.9 184.9a15 15 0 0 1 0 21.21l-184.9 184.9A15 15 0 0 1 202.1 450Z" data-name="1" fill="#7b7b7b" class="fill-000000"></path></svg></span>
                          </div>
                      </div>
                      <div class="comment-likes-container">
                          <span class="comment-likes"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z" fill="#7b7b7b" class="fill-000000"></path></svg></span>
                          <span class="number-comment-likes">124</span>
                      </div> 
                  </div>
                  <div class="write-a-comment">
                      <input type="text" placeholder="Write a comment...">
                  </div>
              </div>
          </section>
      </body>
      </html>

      `
    });
  })
  .then(() => {
    console.log('Image3 successfully created.');

    // Upload image3 to Firebase Storage
    return bucket.upload(image3FilePath, { destination: `images/${image3FileName}` });
  })
  .then(() => {
    console.log('Image3 successfully uploaded to Firebase Storage.');

    // Create a PNG from an HTML template with nodeHtmlToImage for Image 4
    return nodeHtmlToImage({
      content: { imageSource: profilepic, usernameSrc: username, nameSrc: fullName }, // Set the imageSource to the profilepic var
      output: image4FilePath,
      html: `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Twitter Clone</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
      </head>
      <body>
          <style>
              /* Stle reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: sans-serif;
      }
      body{
        margin: 0;
        display: flex;
        width: 1436px;
        height: 760px;
    }
      @font-face {
        font-family: "Roboto";
        src: url(../assets/Roboto-Regular.ttf);
      }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 1.2rem;
        line-height: 1.6;
      }
      
      a {
        text-decoration: none;
      }
      ul {
        list-style: none;
      }
      
      /* Main Containers */
      .main-flex-container {
        max-width: 1350px;
        margin: auto;
        margin-top: 15px;
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
      }
      .left-flex-container {
        flex: 1 0 22%;
        height: 100%;
        position: sticky;
        top: 0;
        background:#fff; 
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        border-right: 1px solid rgb(230, 236, 240);
      }
      .center-flex-container {
       flex: 3 0 56%;
       background:#fff;
      }
      .right-flex-container {
        flex: 2 0 31%;
        height: 100%;
        width: 100%;
        position: sticky;
        top: 0;
        background:#fff;
        border-left: 1px solid rgb(230, 236, 240);
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
      }
      
      /* Left Navigation */
      .logo i{
        color: #000000;
        font-size: 2rem;
        padding: 1rem;
      }
      .nav-links a {
        font-weight: 750;
        color: rgba(44, 46, 48, 0.93);
        padding: 10px 15px;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      
      .current-page a { color: black}
      .nav-items {
        white-space: nowrap;
        display: flex;
        align-items: center;
      }
      .nav-links i {
        padding-right: 0.5rem;
      }
      .nav-links {
        margin-top: -1rem;
      }
      
      .tweet a {
        display: block;
        margin: auto;
        width: 100%;
        color: #fff;
        background: #1da1f2;
        font-size: 1rem;
        font-weight: 700;
        padding: 10px 5rem;
        border-radius: 25px;
      }
      .profile-box {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
        margin-top: 1.5rem;
        align-self: center;
        padding: 0 0.6rem;
      }
      .profile-box img {
        display: block;
        width: 80px;
        height: 80px;
        margin: auto;
        border-radius: 100%;
        margin-right: 0.5rem;
        object-fit: cover;
      }
      
      .profile-box .full-name {
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .profile-box .options-icon {
        color: #39393a;
        margin-left: 1rem;
      }
      
      .user-name {
        color: #39393a;
        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        font-size: 1.1rem;
      }
      
      /* Main Container */
      .home {
        display: flex;
        top: 0;
        background: #fff;
        border-bottom: 1px solid rgb(230, 236, 240);
        color: #39393a;
        padding: 0rem 1rem;
        margin-left: 60px;
        justify-content: space-between;
        margin-right: 100px;
      }
      .home-text {
          display: flex;
          margin-left: 380px;
      }
      .home p{
         margin-left: 0px;
      }
      .underline {
          border-bottom: 4px solid #1da1f2; /* Adjust the thickness here */
          padding-bottom: 10px; /* Adjust the distance from the text here */
        }
      
      /* home panel */
      .home h1 {
        font-size: 1.2rem;
        font-weight: 800;
      }
      .dark{
          font-weight: 700;
      }
      /* Create Tweet box */
      .post-tweet {
        background: #fff;
        border-bottom: 10px solid rgb(230, 236, 240);
      }
      .form-group-1 {
        display: flex;
        flex-flow: row;
        padding: 0.3rem 1rem;
      }
      
      .post-tweet img {
        display: inline-block;
        margin-right: 5px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        align-self: center; 
      }
      
      .post-tweet input {
        width: 90%;
        height: 60px;
        padding: 0.5rem 1rem;
        border: none;
        font-size: 1.2rem;
        font-weight: 300;
      }
      .post-tweet input::placeholder {
        color: rgba(123, 124, 126, 0.719);
      }
      .post-tweet input:focus {
        outline: none;
      }
      .form-group-2 {
        display: flex;
        flex-flow: row;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.8rem;
      }
      
      .post-icons {
        padding-left: 4rem;
        color: #1da1f2;
      }
      .post-icons i {
        padding-right: 10px;
        font-size: 1.4rem;
      }
      .form-group-2 .btn {
        border: none;
        font-weight: 600;
        font-size: 1rem;
        padding: 0.7rem 1rem;
        background: #8ed0f9;
        color: #fff;
        border-radius: 25px;
        margin-right: 1rem;
      }
      
      .btn:focus {
        outline: none;
      }
      
      /* User Content */
      .tweets img {
        display: block;
        width: 90%;
        height: 310px;
      }
      .tweets .user-pics img {
        display: block;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin: 0.5rem 1rem;
        object-fit: cover; /* Add this line */
    }
      .tweets {
        display: flex;
        flex-flow: row;
        justify-content: center;
        font-size: 15px;
        width: 100%;
        line-height: 1.75rem;
        padding-top: 0.5rem;
        border-bottom: 1px solid rgb(230, 236, 240);
      }
      .user-content img {
        border-radius: 20px;
      }
      .user-content {
        font-family: "Roboto";
        padding-right: 1rem;
        color: rgb(48, 52, 56);
        font-weight: 400;
        line-height: 1.5;
      }
      .user-content a {
        color: rgb(27, 149, 224);
      }
      
      .user-content-box {
        display: flex;
        flex-flow: column nowrap;
        color: rgb(20, 23, 26);
      }
      
      .user-content-box .user-names {
        display: flex;
        flex-flow: row nowrap;
      }
      .user-names .full-name {
        padding-right: 10px;
        font-size: 1.6rem;
        font-weight: 700;
        color: rgb(20, 23, 26);
      }
      .user-names .user-name {
        padding-right: 10px;
        font-size: 1.6rem;
        font-weight: 400;
        color: rgb(101, 119, 134);
      }
      .time {
        color: rgb(101, 119, 134);
      }
      .user-names i {
        padding-top: 0.6rem;
        margin-left: 50%;
        color: rgb(101, 119, 134);
      
      }
      .content-icons {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0rem 4rem 1rem 0;
      }
      .sample{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          margin-right: -40px;
          margin-top: 4px;
      }
      .sample i{
          font-size: 20px;
      }
      
      .content-icons i {
        color: rgb(101, 119, 134);
        font-size: 1rem;
        cursor: pointer;
        
      }
      .content-icons i:last-child {
        font-size: 14px;
      }
      
      /* Right Navbar */
      .search-box {
        border: none;
        border-radius: 25px;
        padding: 0.1rem 1rem;
        background: rgb(230, 236, 240);
        margin-top: 0.5rem;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .search-box i {
        color: rgb(101, 119, 134);
        font-size: 0.9rem;
      }
      .search-box input {
        padding: 0.8rem 8rem 0.8rem 0.2rem;
        border-radius: 25px;
        outline: none;
        border: none;
        font-size: 0.9rem;
        background: rgb(230, 236, 240);
      }
      
      /* Trending Nav Items */
      .nav-list {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid rgb(230, 236, 240);
      }
      .nav-list a {
          color: rgb(27, 149, 224);
      }
      .nav-list:last-child {
        font-size: 1rem;
        border-bottom: none;
      }
      .trend-list {
        display: flex;
        flex-flow: column nowrap;
        
      }
      
      .trends {
        background: rgb(245, 248, 250);
        display: flex;
        flex-flow: column nowrap;
        width: 80%;
        border-radius: 15px;
        margin-top: 1rem;
      }
      .trends .header {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.3rem;
        border-bottom: 1px solid rgb(230, 236, 240);
        padding: 0.5rem 1rem;
        border-bottom: 1px solid rgb(230, 236, 240);
      }
      
      .header h2 {
        font-size: 1.2rem;
        font-weight: 800;
      }
      
      .header i {
        color: black;
        background: rgb(245, 248, 250);
        padding: 0.5rem;
        border-radius: 50%
      }
      
      .main-text {
        font-size: 15px;
        font-weight: bold;
        color: rgb(20, 23, 26);
      }
      
      .sub-text {
        font-size: 13px;
        color: rgb(101, 119, 134);
      }
      
      .nav-list .trend-icon {
        font-size: 13px;
        color:  rgb(101, 119, 134);
      }
      
      .right-footer {
        display: flex;
        flex-direction: column;
        width: 80%;
      }
      
      .footer-links {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-start;
        margin-top: 0.5rem;
      }
      .footer-links i {
          padding: 0.4rem;
          border-radius: 50%;
      }
      
      .footer-copyright {
        align-self: flex-start;
      }
      .tweets p{
        font-weight: 600;
        font-size: 22px;
      }
      .follow-users-box {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        font-size: 15px;
        width: 100%;
        line-height: 1.5rem;
      }
      
      .related-followers .sub-text {
        font-size: 14px;
        padding-left: 2.1rem;
      }
      .related-followers i {
        font-size: 0.7rem;
        padding-right: 8px;
      }
      .follow-header .main-text {
        font-size: 19px;
        font-weight: 800;
      }
      .user-name .sub-text {
        font-size: 17px;
        color: rgb(101, 119, 134);
      }
      .follow-header {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid rgb(230, 236, 240);
        border-top: 10px solid rgb(230, 236, 240);
      }
      .mop{
          width: 2rem;
          padding-top: 15px;
      }
      .follow-header i {
        font-size: 13px;
        align-self: center;
        cursor: pointer;
      }
      .navnav{
          width: 1.3rem;
      }
      .navnav2{
          width: 1.1rem;
      }
      .navnav-text{
          display: flex;
          align-items: center;
          gap: 5px;
          color: #567786;
      }
      .navnav3{
          width: 0.9rem;
      }
          </style>
      
        <div class="main-flex-container">
          <div class="left-flex-container flex-item">
            <div class="nav-links">
              <ul>
                <li class="nav-items logo"><a href="#"><svg class="mop" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg></a></li>
                <li class="nav-items current-page"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path  d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg> Home</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M181.3 32.4c17.4 2.9 29.2 19.4 26.3 36.8L197.8 128h95.1l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3s29.2 19.4 26.3 36.8L357.8 128H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H347.1L325.8 320H384c17.7 0 32 14.3 32 32s-14.3 32-32 32H315.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8l9.8-58.7H155.1l-11.5 69.3c-2.9 17.4-19.4 29.2-36.8 26.3s-29.2-19.4-26.3-36.8L90.2 384H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l21.3-128H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h68.9l11.5-69.3c2.9-17.4 19.4-29.2 36.8-26.3zM187.1 192L165.8 320h95.1l21.3-128H187.1z"/></svg> Explore</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v25.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm0 96c61.9 0 112 50.1 112 112v25.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V208c0-61.9 50.1-112 112-112zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"/></svg> Notifications</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg> Messages</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"/></svg> Bookmarks</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H512c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H512c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm96 64a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm104 0c0-13.3 10.7-24 24-24H448c13.3 0 24 10.7 24 24s-10.7 24-24 24H224c-13.3 0-24-10.7-24-24zm0 96c0-13.3 10.7-24 24-24H448c13.3 0 24 10.7 24 24s-10.7 24-24 24H224c-13.3 0-24-10.7-24-24zm0 96c0-13.3 10.7-24 24-24H448c13.3 0 24 10.7 24 24s-10.7 24-24 24H224c-13.3 0-24-10.7-24-24zm-72-64a32 32 0 1 1 0-64 32 32 0 1 1 0 64zM96 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg> Lists</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"/></svg> Profile</a></li>
                <li class="nav-items"><a href="#"><svg class="navnav" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#323232" d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg> More</a></li>
              </ul>
            </div>
            <div class="tweet"><a href="#">Post</a></div>
            <div class="profile-box">
            <img src="{{imageSource}}" alt="">
              <div class="profile-link">
                <p class="full-name">{{nameSrc}}</p>
                <p class="user-name">@{{usernameSrc}}</p>
              </div>
              <div class="options-icon"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"/></svg></div>
            </div>
          </div>
      
          <div class="center-flex-container flex-item">
            <div class="home">
              <p class="dark underline">For you</p>
              <p>Following</p>
            </div>
      
            <div class="post-tweet">
            </div>
            <!-- User Content -->
              <div class="tweets">
                <div class="user-pics"> <img src="{{imageSource}}" alt=""></div>
                <div class="user-content-box">
                  <div class="user-names">
                    <hi class="full-name">{{nameSrc}}</hi>
                    <p class="user-name">@{{usernameSrc}}</p>
                    <p class="time"> . 2hrs</p>
                  </div>
                  
                  <div class="user-content">
                    <p>These creatures’ furs make for great coats! The first one was not yet mature enough so I had to let him go unfortunately. Such a shame. I may not soon meet a beast with such thick coat.  Good news is I took one big guy down. Efforts pay off peeps!        <a href="#">#monthlyHunt</a> <a href="#">#hobby</a> <a href="#">#hunting</a></p>
                    <img src="https://api.apify.com/v2/key-value-stores/P6Lg101zEWZKKmXQu/records/FILE-2" alt="content1"><!--https://i.postimg.cc/ZYGFKvDJ/IMG-20240520-WA0019.jpg-->
                  </div>
        
                  <div class="content-icons">
                      <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z"/></svg>273</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M272 416c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32-14.3-32-32V192h32c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-64-64c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l32 0 0 128c0 53 43 96 96 96H272zM304 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32 14.3 32 32l0 128H416c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8l-32 0V192c0-53-43-96-96-96L304 96z"/></svg>2k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>1k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z"/></svg>1m</p>
                    <div class="sample">
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"/></svg></p>
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></p>
                  </div>
                  </div>
        
                </div>
              </div>
      
              <div class="tweets">
                <div class="user-pics"> <img src="https://i.postimg.cc/qvN19fbg/irene-strong-v2a-Knj-Mb-P-k-unsplash.jpg" alt=""></div>
                <div class="user-content-box">
                  <div class="user-names">
                    <hi class="full-name">The DilDozer</hi>
                    <p class="user-name">@TheDilDozer</p>
                    <p class="time"> . 4hrs</p>
                  </div>
                  
                  <div class="user-content">
                    <p>There's no clear correlation between your background and what you are going to achieve in life..</p>
                  </div>
      
                  <div class="content-icons">
                      <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z"/></svg>273</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M272 416c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32-14.3-32-32V192h32c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-64-64c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l32 0 0 128c0 53 43 96 96 96H272zM304 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l112 0c17.7 0 32 14.3 32 32l0 128H416c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8l-32 0V192c0-53-43-96-96-96L304 96z"/></svg>2k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>1k</p>
                    <p class="navnav-text"><svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z"/></svg>1m</p>
                    <div class="sample">
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M0 48C0 21.5 21.5 0 48 0l0 48V441.4l130.1-92.9c8.3-6 19.6-6 27.9 0L336 441.4V48H48V0H336c26.5 0 48 21.5 48 48V488c0 9-5 17.2-13 21.3s-17.6 3.4-24.9-1.8L192 397.5 37.9 507.5c-7.3 5.2-16.9 5.9-24.9 1.8S0 497 0 488V48z"/></svg></p>
                    <p class="navnav-text"><svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#567786" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></p>
                  </div>
                  </div>
        
                </div>
              </div>
      
              <section class="follow-users-box">
      
                <div class="follow-header">
                  <h1 class="main-text">Who to follow</h1>
                  <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                </div>
              </section>
          </div>
      
          
      
          <div class="right-flex-container flex-item">
            <div class="search-box">
              <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
              <input type="text" placeholder="Search Twitter">
            </div>
      
            <div class="trends">
              <ul>
                <li class="nav-list header">
                  <h2>Trends for you</h2>
                  <svg class="navnav2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="black" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Eindhoven</p>
                    <p class="sub-text">274K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Shrek</p>
                    <p class="sub-text">154K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Netflix</p>
                    <p class="sub-text">135K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#Dora</p>
                    <p class="sub-text">124K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                <li class="nav-list">
                  <div class="trend-list">
                    <p class="sub-text">Trending in Eindhoven</p>
                    <p class="main-text">#TGIF</p>
                    <p class="sub-text">43K Tweets</p>
                  </div>
                  <div class="trend-icon">
                      <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                  </div>
                </li>
                
                
                <li class="nav-list"><a href="#">Show more</a></li>
              </ul>
            </div>
      
            <div class="right-footer">
              <div class="footer-links">
                <a href="#" class="sub-text">Terms</a>
                <a href="#" class="sub-text">Privacy policy</a>
                <a href="#" class="sub-text">Ads info</a>
                <a href="#" class="sub-text">more</a>
                <svg class="navnav3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="grey" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
              </div>
              <div class="footer-copyright">
                <p class="sub-text">&copy; 2024 X, Inc.</p>
              </div>
      
            </div>
          
          </div>
          
        </div>
        
      </body>
      </html>
      `
    });
  })
  .then(() => {
    console.log('Image4 successfully created.');

    // Upload image4 to Firebase Storage
    return bucket.upload(image4FilePath, { destination: `images/${image4FileName}` });
  })
  .then(() => {
    console.log('Image4 successfully uploaded to Firebase Storage.');
    return nodeHtmlToImage({
      content: { imageSource: profilepic, usernameSrc: username, nameSrc: fullName }, // Set the imageSource to the profilepic var
      output: image5FilePath,
      html: `
      <html lang="en">
      <head>
      
          <!-- Metadata -->
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <meta name="author" content="">
          <meta name="description" content="">
      
          <!-- Title -->
          <title>Instagram Profile Layout</title>
      
          <!-- External CSS Files -->
          <link rel="stylesheet" href="/css/reset.css">
          <link rel="stylesheet" href="/css/styles.css">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600">
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css">
      
      </head>
      <body>
          <style>
              
      :root {
          font-size: 10px;
      }
      
      *,
      *::before,
      *::after {
          box-sizing: border-box;
      }
      
      body {
          font-family: "Open Sans", Arial, sans-serif;
          width: 1436px;
        height: 770px;
          background-color: #fafafa;
          color: #262626;
          padding-bottom: 3rem;
      }
      
      img {
          display: block;
      }
      
      .container {
          max-width: 120rem;
          margin: 0 auto;
          padding: 0 2rem;
      }
      
      .btn {
          display: inline-block;
          font: inherit;
          background: none;
          border: none;
          color: inherit;
          padding: 0;
          cursor: pointer;
      }
      
      .visually-hidden {
          position: absolute !important;
          height: 1px;
          width: 1px;
          overflow: hidden;
          clip: rect(1px, 1px, 1px, 1px);
      }
      
      /* Profile Section */
      
      
      .profile::after {
          content: "";
          display: block;
          clear: both;
      }
      .profile-image {
              display: flex;
              flex-flow: row nowrap;
              justify-content: center;
              align-items: center;
              margin-top: 1.5rem;
              align-self: center;
              padding: 0 0.6rem;
            }
            .profile-image img {
              display: block;
              width: 200px;
              height: 200px;
              margin: auto;
              border-radius: 100%;
              margin-right: 0.5rem;
              object-fit: cover;
            }
      
      .profile-user-settings,
      .profile-stats,
      .profile-bio {
          float: left;
          width: calc(66.666% - 2rem);
      }
      
      .profile-user-settings {
          margin-top: 1.1rem;
      }
      
      .profile-user-name {
          display: inline-block;
          font-size: 3.2rem;
          font-weight: 300;
      }
      
      .profile-edit-btn {
          font-size: 1.4rem;
          line-height: 1.8;
          border: 0.1rem solid #dbdbdb;
          border-radius: 0.3rem;
          padding: 0 2.4rem;
          margin-left: 2rem;
      }
      
      .profile-settings-btn {
          font-size: 2rem;
          margin-left: 1rem;
      }
      
      .profile-stats {
          margin-top: 2.3rem;
      }
      
      .profile-stats li {
          display: inline-block;
          font-size: 1.6rem;
          line-height: 1.5;
          margin-right: 4rem;
          cursor: pointer;
      }
      
      .profile-stats li:last-of-type {
          margin-right: 0;
      }
      
      .profile-bio {
          font-size: 3rem;
          font-weight: 500;
          line-height: 1.5;
          margin-top: 2.3rem;
      }
      
      .profile-real-name,
      .profile-stat-count,
      .profile-edit-btn {
          font-weight: 600;
          font-size: 18px;
      }
      
      /* Gallery Section */
      
      .gallery {
          display: flex;
          flex-wrap: wrap;
          margin: -1rem -1rem;
          padding-bottom: 3rem;
      }
      
      .gallery-item {
          position: relative;
          flex: 1 0 22rem;
          margin: 1rem;
          color: #fff;
          cursor: pointer;
      }
      
      .gallery-item-info {
          display: none;
      }
      
      .gallery-item-info li {
          display: inline-block;
          font-size: 1.7rem;
          font-weight: 600;
      }
      
      .gallery-item-likes {
          margin-right: 2.2rem;
      }
      
      .gallery-item-type {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2.5rem;
          text-shadow: 0.2rem 0.2rem 0.2rem rgba(0, 0, 0, 0.1);
      }
      .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
      }
      
      /* Loader */
      
      .loader {
          width: 5rem;
          height: 5rem;
          border: 0.6rem solid #999;
          border-bottom-color: transparent;
          border-radius: 50%;
          margin: 0 auto;
          animation: loader 500ms linear infinite;
      }
      @supports (display: grid) {
          .profile {
              display: grid;
              grid-template-columns: 1fr 2fr;
              grid-template-rows: repeat(3, auto);
              grid-column-gap: 3rem;
              align-items: center;
          }
      
          .profile-image {
              grid-row: 1 / -1;
          }
      
          .gallery {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(32rem, 1fr));
              grid-gap: 2rem;
          }
      
          .profile-image,
          .profile-user-settings,
          .profile-stats,
          .profile-bio,
          .gallery-item,
          .gallery {
              width: auto;
              margin: 0;
          }
      
          @media (max-width: 40rem) {
              .profile {
                  grid-template-columns: auto 1fr;
                  grid-row-gap: 1.5rem;
              }
      
              .profile-image {
                  grid-row: 1 / 2;
              }
      
              .profile-user-settings {
                  display: grid;
                  grid-template-columns: auto 1fr;
                  grid-gap: 1rem;
              }
      
              .profile-edit-btn,
              .profile-stats,
              .profile-bio {
                  grid-column: 1 / -1;
              }
      
              .profile-user-settings,
              .profile-edit-btn,
              .profile-settings-btn,
              .profile-bio,
              .profile-stats {
                  margin: 0;
              }
          }
      }
      .options{
          max-width: 115rem;
          margin: 0 auto;
          padding: 0 2rem;
          justify-content: center;
          align-items: center;
          display: flex;
          border-top: 1px solid grey;
      }
      .optionbox{
          display: flex;
          width: 500px;
          justify-content: space-between;
      }
      .option-text{
          display: flex;
          justify-content: space-between;
          width: 100%;
      }
      .option-text p{
          font-size: 20px;
          display: flex;
          gap: 10px;
      }
      
      svg{
          width: 20px;
      }
      .thick{
          position: absolute;
          right: 890px;
          top: 332px;
          width: 120px;
          height: 4px;
          border-radius: 20px;
          background: rgb(86, 86, 86);
          display: flex;
          justify-content: center;
          align-items: center;
      }
          </style>
          <header>
      
              <div class="container">
                  <div class="profile">
                      <div class="profile-image">
                          <img src="{{imageSource}}" alt="">
                      </div>
                      <div class="profile-user-settings">
                          <h1 class="profile-user-name">{{usernameSrc}}</h1>
                          <button class="btn profile-edit-btn">Edit Profile</button>
                          <button class="btn profile-settings-btn" aria-label="profile settings"><i class="fas fa-cog" aria-hidden="true"></i></button>
                      </div>
                      <div class="profile-stats">
                          <ul>
                              <li><span class="profile-stat-count">164</span> posts</li>
                              <li><span class="profile-stat-count">188</span> followers</li>
                              <li><span class="profile-stat-count">206</span> following</li>
                          </ul>
                      </div>
                      <div class="profile-bio">
                          <p><span class="profile-real-name">{{nameSrc}}</span> Queer they/them vibes with a side of gay sass. 💖✨ Exploring the rainbow one message at a time. 🏳️‍🌈 #LGBTQ+</p>
                      </div>
                  </div>
                  <!-- End of profile section -->
              </div>
              <!-- End of container -->
          </header>
      <section class="options">
          <div class="optionbox">
              <div class="option-text">
                  <div class="thick"></div>
                  <p class="berichten"> <svg xmlns="http://www.w3.org/2000/svg" aria-label="Reels" class="x1lliihq x1n2onr6 x5n08af" fill="currentColor" role="img" viewBox="0 0 24 24"><title>Reels</title><line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line><path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="M9.763 17.664a.908.908 0 0 1-.454-.787V11.63a.909.909 0 0 1 1.364-.788l4.545 2.624a.909.909 0 0 1 0 1.575l-4.545 2.624a.91.91 0 0 1-.91 0Z" fill-rule="evenodd"></path></svg>Berichten</p>
              <p> <svg xmlns="http://www.w3.org/2000/svg" aria-label="" class="x1lliihq x1n2onr6 x5n08af" fill="currentColor" role="img" viewBox="0 0 24 24"><title></title><rect fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>Reels</p>
              <p><svg xmlns="http://www.w3.org/2000/svg" aria-label="" class="x1lliihq x1n2onr6 x1roi4f4" fill="currentColor" role="img" viewBox="0 0 24 24"><title></title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon></svg> opgelsagen</p>
              <p> <svg xmlns="http://www.w3.org/2000/svg" aria-label="" class="x1lliihq x1n2onr6 x1roi4f4" fill="currentColor" role="img" viewBox="0 0 24 24"><title></title><path d="M10.201 3.797 12 1.997l1.799 1.8a1.59 1.59 0 0 0 1.124.465h5.259A1.818 1.818 0 0 1 22 6.08v14.104a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 20.184V6.08a1.818 1.818 0 0 1 1.818-1.818h5.26a1.59 1.59 0 0 0 1.123-.465Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="M18.598 22.002V21.4a3.949 3.949 0 0 0-3.948-3.949H9.495A3.949 3.949 0 0 0 5.546 21.4v.603" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><circle cx="12.072" cy="11.075" fill="none" r="3.556" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle></svg> tags </p>
          </div>
          </div>
      </section>
          <main>
              <div class="container">
                  <div class="gallery">
                      <div class="gallery-item" tabindex="0">
                          <img src="https://i.postimg.cc/3Nzd9GV9/de-canal-parade-dit-jaar.webp" class="gallery-image" alt="">
                          <div class="gallery-item-info">
                              <ul>
                                  <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 56</li>
                                  <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 2</li>
                              </ul>
                          </div>
                      </div>
                      <div class="gallery-item" tabindex="0">
                          <img src="{{imageSource}}" class="gallery-image" alt="">
                          <div class="gallery-item-info">
                              <ul>
                                  <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 89</li>
                                  <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 5</li>
                              </ul>
                          </div>
                      </div>
                      <div class="gallery-item" tabindex="0">
                          <img src="https://i.postimg.cc/vTxm1BTn/000-33-J367-T.jpg" class="gallery-image" alt="">
                          <div class="gallery-item-type">
                              <span class="visually-hidden">Gallery</span><i class="fas fa-clone" aria-hidden="true"></i>
                          </div>
                          <div class="gallery-item-info">
                              <ul>
                                  <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 42</li>
                                  <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 1</li>
                              </ul>
                          </div>
                      </div>
                      <div class="gallery-item" tabindex="0">
                          <img src="https://images.unsplash.com/photo-1502630859934-b3b41d18206c?w=500&h=500&fit=crop" class="gallery-image" alt="">
                          <div class="gallery-item-type">
                              <span class="visually-hidden">Video</span><i class="fas fa-video" aria-hidden="true"></i>
                          </div>
                          <div class="gallery-item-info">
                              <ul>
                                  <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 38</li>
                                  <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 0</li>
                              </ul>
                          </div>
                      </div>
                      <div class="gallery-item" tabindex="0">
                          <img src="https://images.unsplash.com/photo-1498471731312-b6d2b8280c61?w=500&h=500&fit=crop" class="gallery-image" alt="">
                          <div class="gallery-item-type">
                              <span class="visually-hidden">Gallery</span><i class="fas fa-clone" aria-hidden="true"></i>
                          </div>
                          <div class="gallery-item-info">
                              <ul>
                                  <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 47</li>
                                  <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 1</li>
                              </ul>
                          </div>
                      </div>
                      <div class="gallery-item" tabindex="0">
                          <img src="https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=500&h=500&fit=crop" class="gallery-image" alt="">
                          <div class="gallery-item-info">
                              <ul>
                                  <li class="gallery-item-likes"><span class="visually-hidden">Likes:</span><i class="fas fa-heart" aria-hidden="true"></i> 94</li>
                                  <li class="gallery-item-comments"><span class="visually-hidden">Comments:</span><i class="fas fa-comment" aria-hidden="true"></i> 3</li>
                              </ul>
                          </div>
                      </div>
                      </div>
                  </div>
              </div>
          </main>
      </body>
      </html>
      `
    });
  })
  .then(() => {
    console.log('Image5 successfully created.');
  
    // Upload image5 to Firebase Storage
    return bucket.upload(image5FilePath, { destination: `images/${image5FileName}` });
  })
  .then(() => {
    console.log('Image5 successfully uploaded to Firebase Storage.');

    return nodeHtmlToImage({
      content: { unfilteredSrc: profilepic, devilFilterSrc: filterImg3DataURI, maskFilterSrc: filterImg4DataURI }, // Set the imageSource to the profilepic var
      output: image6FilePath,
      html: `
      <html lang="en">
        <head>
            <style>
            *{
              box-sizing: border-box;
          }
          :root{
              --bg: #282828;
              --text: #e1e1e1;
          }
          body{
              margin: 0;
              font-family: sans-serif;
              background-color: var(--bg);
              color: var(--text);
              width: 1536px;
              height: 681px;
          }
          figure{
              margin: 0;
          }
          header{
              width: 100%;
              height: 60px;
              border-bottom: 4px solid rgb(225, 225, 225, 0.2);
              display: flex;
              padding-block: 10px;
              padding-inline: 25px;
              justify-content: space-between;
          }
          figure.face-cam-logo{
              display: flex; /*position the logo and the filter app name next to each other*/
              gap: 10px;
          }
          figure.face-cam-logo>img{
              width: 40px;
          }
          figure.face-cam-logo>figcaption{
              align-self: center;
              font-size: 18px;
          }
          .window-actions{
              display: flex;
              gap: 10px;
              align-items: center;
              height: fit-content;
          }
          .minimize-window{
              width: 20px;
              height: 2px;
              background-color: var(--text);
              margin-right: 12px;
          }
          .resize-window{
              width: 20px;
              height: 20px;
              border-radius: 3px;
              border: 2px solid var(--text);
              position: relative;
              top: -2px;
          }
          span.close-window>svg{
              width: 32px;
          }
          /*main page content*/
          .flex-main{
              display: flex;
              gap: 20px;
              padding-left: 10%;
              padding-right: 10px;
              width: 100%;
              justify-content: space-between;
          }
          main{
              display: flex;
              gap: 80px;
          }
          /*the icons above the big filter image*/
          .top-filter-icons{ 
              display: flex;
              gap: 20px;
              justify-content: end;
              margin-block: 10px;
          }
          .top-filter-icons>span{
              width: 50px;
              height: 50px;
              border-radius: 50%;
              background-color: #333333;
              display: flex;
              justify-content: center;
              align-items: center;
          }
          .top-filter-icons>span>svg{
              width: 30px;
          }
          /*the container for the big filter image*/
          figure.main-filter-container{
              width: 800px;
              height: 445px;
              margin-bottom: 10px;
          }
          figure.main-filter-container>img{
              object-fit: cover;
              width: 100%;
              height: 100%;
          }
          /*filter options below the big filter image*/
          .bottom-filter-options{
              display: flex;
              gap: 10px;
              justify-content: center;
          }
          .bottom-filter-options>div{
              width: 130px;
              height: 80px;
              border-radius: 5px;
          }
          .bottom-filter-options>.current-effect>img{
              object-fit: cover;
              width: 100%;
              height: 100%;
              border-radius: 5px;
          }
          .bottom-filter-options>.add-effect, .other-filters-options .add-other-effect{
              background-color: #151515;
              display: flex; /*center the plus sign inside*/
              justify-content: center;
              align-items: center;
          }
          .bottom-filter-options>.add-effect>span{
              font-size: 26px;
              font-weight: 600;
          }
          /*other filters to the right of the big filter image*/
          .other-filters-container{
              margin-top: 10px;
          }
          .other-filters-options{
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              max-width: 350px;
          }
          .other-filters-options figure, .add-other-effect{
              width: 160px;
              height: 100px;
              border-radius: 5px;
          }
          .other-filters-options figure>img{
              object-fit: cover;
              width: 100%;
              height: 100%; 
              border-radius: 5px;  
          }
          .other-filter>span{
              display: flex;
              justify-content: center;
              margin-top: 7px;
          }
          .other-filter:nth-of-type(2) figure{ /*decrease the opacity of the currently applied filter*/
              filter: opacity(0.6);
          }
          .other-filter:nth-of-type(2) span{
              color: rgb(225, 225, 225, 0.6);
          }
          .add-other-effect span{
              font-size: 24px;
              font-weight: 600;
          }
          /*sidebar to the right*/
          .sidebar{
              width: 60px;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 30px;
              margin-top: 60px;
          }
          .sidebar svg{
              width: 30px;
          }
            </style>
        </head>
        <body>
        <header>
            <figure class="face-cam-logo"><img src="https://cdn.iconscout.com/icon/free/png-256/free-apple-camera-493147.png" alt=""><figcaption>FunCam</figcaption></figure>
            <div class="window-actions">
                <div class="minimize-window"></div>
                <div class="resize-window"></div>
                <span class="close-window"><svg viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"><path d="M5.3 18.7c.2.2.4.3.7.3s.5-.1.7-.3l5.3-5.3 5.3 5.3c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4L13.4 12l5.3-5.3c.4-.4.4-1 0-1.4s-1-.4-1.4 0L12 10.6 6.7 5.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l5.3 5.3-5.3 5.3c-.4.4-.4 1 0 1.4z" id="_icons" fill="#e1e1e1" class="fill-000000"></path></svg></span>
            </div>
        </header>
        <div class="flex-main">
            <main>
                <div class="main-filter-content">
                    <div class="top-filter-icons">
                        <span><svg baseProfile="tiny" version="1.2" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M12 16c2.206 0 4-1.795 4-4V6c0-2.206-1.794-4-4-4S8 3.794 8 6v6c0 2.205 1.794 4 4 4z" fill="#e1e1e1" class="fill-000000"></path><path d="M19 12v-2a1 1 0 1 0-2 0v2c0 2.757-2.243 5-5 5s-5-2.243-5-5v-2a1 1 0 1 0-2 0v2c0 3.52 2.613 6.432 6 6.92V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-1.08c3.387-.488 6-3.4 6-6.92z" fill="#e1e1e1" class="fill-000000"></path></svg></span>
                        <span><svg baseProfile="tiny" version="1.2" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M19 6h-1.586l-1-1c-.579-.579-1.595-1-2.414-1h-4c-.819 0-1.835.421-2.414 1l-1 1H5C3.346 6 2 7.346 2 9v8c0 1.654 1.346 3 3 3h14c1.654 0 3-1.346 3-3V9c0-1.654-1.346-3-3-3zm-7 10a3.5 3.5 0 1 1 .001-7.001A3.5 3.5 0 0 1 12 16zm6-4.701a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z" fill="#e1e1e1" class="fill-000000"></path></svg></span>
                        <span><svg viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 32 32"><path d="M0 0h32v32H0z" fill="none"></path><circle cx="16" cy="16" r="4" fill="#e1e1e1" class="fill-000000"></circle><path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 20c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="#e1e1e1" class="fill-000000"></path></svg></span>
                    </div>
                    <!--ADD 'filter-img3.png' HERE-->
                    <figure class="main-filter-container"><img src="{{devilFilterSrc}}" alt=""></figure>
                    <div class="bottom-filter-options">
                        <!--ADD 'filter-img3.png' HERE TOO-->
                        <div class="current-effect"><img src="{{devilFilterSrc}}" alt=""></div>
                        <div class="add-effect"><span>+</span></div>
                    </div>
                </div>
                <div class="other-filters-container">
                    <h3>Filters</h3>
                    <div class="other-filters-options">
                        <div class="other-filter">
                            <figure>
                                <!--'1.png' GOES HERE-->
                                <img src="{{unfilteredSrc}}" alt="">
                            </figure>
                            <span>Original</span>
                        </div>

                        <div class="other-filter">
                            <figure>
                                <!--'filter-img3.png' GOES HERE-->
                                <img src="{{devilFilterSrc}}" alt="">
                            </figure>
                            <span>Devil horns</span>
                        </div>

                        <div class="other-filter">
                            <figure>
                                <!--'filter-img4.png' GOES HERE-->
                                <img src="{{maskFilterSrc}}" alt="">
                            </figure>
                            <span>Vendetta mask</span>
                        </div>

                        <div class="other-filter">
                            <div class="add-other-effect">
                                <span>+</span>
                            </div>
                            <span>Add effect</span>
                        </div>
                    </div>
                </div>
            </main>
            <div class="sidebar">
                <span><svg viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"><ellipse cx="12" cy="8" rx="5" ry="6" fill="#e1e1e1" class="fill-000000"></ellipse><path d="M21.8 19.1c-.9-1.8-2.6-3.3-4.8-4.2-.6-.2-1.3-.2-1.8.1-1 .6-2 .9-3.2.9s-2.2-.3-3.2-.9c-.5-.2-1.2-.3-1.8 0-2.2.9-3.9 2.4-4.8 4.2-.7 1.3.4 2.8 1.9 2.8h15.8c1.5 0 2.6-1.5 1.9-2.9z" fill="#e1e1e1" class="fill-000000"></path></svg></span>
                <span><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g data-name="Layer 2"><path d="M18 11a1 1 0 0 1-1 1 5 5 0 0 0-5 5 1 1 0 0 1-2 0 5 5 0 0 0-5-5 1 1 0 0 1 0-2 5 5 0 0 0 5-5 1 1 0 0 1 2 0 5 5 0 0 0 5 5 1 1 0 0 1 1 1ZM19 24a1 1 0 0 1-1 1 2 2 0 0 0-2 2 1 1 0 0 1-2 0 2 2 0 0 0-2-2 1 1 0 0 1 0-2 2 2 0 0 0 2-2 1 1 0 0 1 2 0 2 2 0 0 0 2 2 1 1 0 0 1 1 1ZM28 17a1 1 0 0 1-1 1 4 4 0 0 0-4 4 1 1 0 0 1-2 0 4 4 0 0 0-4-4 1 1 0 0 1 0-2 4 4 0 0 0 4-4 1 1 0 0 1 2 0 4 4 0 0 0 4 4 1 1 0 0 1 1 1Z" fill="#e1e1e1" class="fill-000000"></path></g></svg></span>
                <span><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g data-name="Layer 2"><path d="M28 9H11a1 1 0 0 1 0-2h17a1 1 0 0 1 0 2ZM7 9H4a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2ZM21 17H4a1 1 0 0 1 0-2h17a1 1 0 0 1 0 2ZM11 25H4a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2Z" fill="#e1e1e1" class="fill-000000"></path><path d="M9 11a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm0-4a1 1 0 1 0 1 1 1 1 0 0 0-1-1ZM23 19a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm0-4a1 1 0 1 0 1 1 1 1 0 0 0-1-1ZM13 27a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm0-4a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z" fill="#e1e1e1" class="fill-000000"></path><path d="M28 17h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2ZM28 25H15a1 1 0 0 1 0-2h13a1 1 0 0 1 0 2Z" fill="#e1e1e1" class="fill-000000"></path></g><path d="M0 0h32v32H0z" fill="none"></path></svg></span>
            </div>
        </div>
  </body>
</html>
      `
    });
  })
  .then(() => {
    console.log('Image6 successfully created.');
  
    // Upload image5 to Firebase Storage
    return bucket.upload(image6FilePath, { destination: `images/${image6FileName}` });
  })
  .then(() => {
    console.log('Image6 successfully uploaded to Firebase Storage.');

    return nodeHtmlToImage({
      content: { imageSource: profilepic, firstAd: ad1Src, secondAd: ad2Src, thirdAd: ad3Src, companyName: ad1Company }, // Set the imageSource to the profilepic var
      output: image7FilePath,
      html: `
      <html>
      <head>
          <style>
            :root{
                --gray: #dbdbdb;
                --darkGray: rgb(115, 115, 115);
            }
            *{
                box-sizing: border-box;
            }
            body{
                margin: 0;
                font-family: sans-serif;
                display: flex;
                overflow-y: hidden;
                width: 1536px;
                height: 681px;
            }
            figure{
                margin: 0;
            }
            ul{
                list-style-type: none;
                padding-left: 0;
            }
            main{
                display: flex;
                justify-content: space-around;
                width: 100%;
            }
            /*navigation bar*/
            nav{
                display: flex;
                flex-direction: column;
                width: 240px;
                border-right: 1px solid var(--gray);
                height: 100vh;
                padding-inline: 25px;
                padding-block: 40px;
            }
            nav ul li, nav>div{
                display: flex;
                gap: 17px;
                margin-bottom: 30px;
            }
            nav ul li span, nav>div>span{
                align-self: center;
            }
            nav ul li figure{
                width: 25px;
                height: 25px;
            }
            nav ul li figure>img{
                object-fit: cover;
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
            nav ul{
                margin-bottom: 50px;
            }
            figure.logo{
                margin-bottom: 30px;
            }
            /*post*/
            .post{
                width: 468px;
                margin-bottom: 50px;
            }
            .post:first-of-type{
                margin-top: -380px;
            }
            /*top content of post with icon and name of poster*/
            .post-top-info{
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .post-icon-info{
                display: flex;
                gap: 10px;
            }
            .post-icon-info>figure{
                width: 35px;
                height: 35px;
            }
            .post-icon-info>figure>img{
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            .main-advertiser-name{
                display: flex;
                flex-direction: column;
            }
            .main-advertiser-name>span:first-of-type{
                font-size: 15px;
                font-weight: 600;
            }
            .main-advertiser-name>span:last-of-type{
                font-size: 14px;
            }
            .post>figure{ /*the post picture or video container*/
                width: 468px;
                height: 500px;
                margin-bottom: 10px;
            }
            .post>figure>img{
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .post-actions{
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .left-actions>span{
                margin-right: 10px;
            }
            .likes{
                margin-bottom: 10px;
            }
            .author-info{
                margin-bottom: 10px;
            }
            .author-info>span{
            margin-right: 5px;
            }
            .likes span, .author-info span.user{
                font-weight: 600;
            }
            .view-comments{
                margin-bottom: 10px;
            }
            .view-comments span{
                color: var(--darkGray);
            }
            .add-comment{
                display: flex;
                justify-content: space-between;
            }
            .add-comment span{
                color: var(--gray);
            }
            hr.comment-line{
                height: 1px;
                background-color: var(--gray);
                border: none;
            }
            /*ads container to the right*/
            .more-ads figure.ad{
                width: 450px;
                height: 220px;
                margin-bottom: 50px;
            }
            .more-ads figure.ad>img{
                object-fit: cover;
                width: 100%;
                height: 100%;
            }
          </style>
      <body>
          <!--navigation bar to the left-->
          <nav>
              <figure class="logo">
                  <svg fill="#000000" height="29" role="img" viewBox="32 4 113 32" width="103"><path clip-rule="evenodd" d="M37.82 4.11c-2.32.97-4.86 3.7-5.66 7.13-1.02 4.34 3.21 6.17 3.56 5.57.4-.7-.76-.94-1-3.2-.3-2.9 1.05-6.16 2.75-7.58.32-.27.3.1.3.78l-.06 14.46c0 3.1-.13 4.07-.36 5.04-.23.98-.6 1.64-.33 1.9.32.28 1.68-.4 2.46-1.5a8.13 8.13 0 0 0 1.33-4.58c.07-2.06.06-5.33.07-7.19 0-1.7.03-6.71-.03-9.72-.02-.74-2.07-1.51-3.03-1.1Zm82.13 14.48a9.42 9.42 0 0 1-.88 3.75c-.85 1.72-2.63 2.25-3.39-.22-.4-1.34-.43-3.59-.13-5.47.3-1.9 1.14-3.35 2.53-3.22 1.38.13 2.02 1.9 1.87 5.16ZM96.8 28.57c-.02 2.67-.44 5.01-1.34 5.7-1.29.96-3 .23-2.65-1.72.31-1.72 1.8-3.48 4-5.64l-.01 1.66Zm-.35-10a10.56 10.56 0 0 1-.88 3.77c-.85 1.72-2.64 2.25-3.39-.22-.5-1.69-.38-3.87-.13-5.25.33-1.78 1.12-3.44 2.53-3.44 1.38 0 2.06 1.5 1.87 5.14Zm-13.41-.02a9.54 9.54 0 0 1-.87 3.8c-.88 1.7-2.63 2.24-3.4-.23-.55-1.77-.36-4.2-.13-5.5.34-1.95 1.2-3.32 2.53-3.2 1.38.14 2.04 1.9 1.87 5.13Zm61.45 1.81c-.33 0-.49.35-.61.93-.44 2.02-.9 2.48-1.5 2.48-.66 0-1.26-1-1.42-3-.12-1.58-.1-4.48.06-7.37.03-.59-.14-1.17-1.73-1.75-.68-.25-1.68-.62-2.17.58a29.65 29.65 0 0 0-2.08 7.14c0 .06-.08.07-.1-.06-.07-.87-.26-2.46-.28-5.79 0-.65-.14-1.2-.86-1.65-.47-.3-1.88-.81-2.4-.2-.43.5-.94 1.87-1.47 3.48l-.74 2.2.01-4.88c0-.5-.34-.67-.45-.7a9.54 9.54 0 0 0-1.8-.37c-.48 0-.6.27-.6.67 0 .05-.08 4.65-.08 7.87v.46c-.27 1.48-1.14 3.49-2.09 3.49s-1.4-.84-1.4-4.68c0-2.24.07-3.21.1-4.83.02-.94.06-1.65.06-1.81-.01-.5-.87-.75-1.27-.85-.4-.09-.76-.13-1.03-.11-.4.02-.67.27-.67.62v.55a3.71 3.71 0 0 0-1.83-1.49c-1.44-.43-2.94-.05-4.07 1.53a9.31 9.31 0 0 0-1.66 4.73c-.16 1.5-.1 3.01.17 4.3-.33 1.44-.96 2.04-1.64 2.04-.99 0-1.7-1.62-1.62-4.4.06-1.84.42-3.13.82-4.99.17-.8.04-1.2-.31-1.6-.32-.37-1-.56-1.99-.33-.7.16-1.7.34-2.6.47 0 0 .05-.21.1-.6.23-2.03-1.98-1.87-2.69-1.22-.42.39-.7.84-.82 1.67-.17 1.3.9 1.91.9 1.91a22.22 22.22 0 0 1-3.4 7.23v-.7c-.01-3.36.03-6 .05-6.95.02-.94.06-1.63.06-1.8 0-.36-.22-.5-.66-.67-.4-.16-.86-.26-1.34-.3-.6-.05-.97.27-.96.65v.52a3.7 3.7 0 0 0-1.84-1.49c-1.44-.43-2.94-.05-4.07 1.53a10.1 10.1 0 0 0-1.66 4.72c-.15 1.57-.13 2.9.09 4.04-.23 1.13-.89 2.3-1.63 2.3-.95 0-1.5-.83-1.5-4.67 0-2.24.07-3.21.1-4.83.02-.94.06-1.65.06-1.81 0-.5-.87-.75-1.27-.85-.42-.1-.79-.13-1.06-.1-.37.02-.63.35-.63.6v.56a3.7 3.7 0 0 0-1.84-1.49c-1.44-.43-2.93-.04-4.07 1.53-.75 1.03-1.35 2.17-1.66 4.7a15.8 15.8 0 0 0-.12 2.04c-.3 1.81-1.61 3.9-2.68 3.9-.63 0-1.23-1.21-1.23-3.8 0-3.45.22-8.36.25-8.83l1.62-.03c.68 0 1.29.01 2.19-.04.45-.02.88-1.64.42-1.84-.21-.09-1.7-.17-2.3-.18-.5-.01-1.88-.11-1.88-.11s.13-3.26.16-3.6c.02-.3-.35-.44-.57-.53a7.77 7.77 0 0 0-1.53-.44c-.76-.15-1.1 0-1.17.64-.1.97-.15 3.82-.15 3.82-.56 0-2.47-.11-3.02-.11-.52 0-1.08 2.22-.36 2.25l3.2.09-.03 6.53v.47c-.53 2.73-2.37 4.2-2.37 4.2.4-1.8-.42-3.15-1.87-4.3-.54-.42-1.6-1.22-2.79-2.1 0 0 .69-.68 1.3-2.04.43-.96.45-2.06-.61-2.3-1.75-.41-3.2.87-3.63 2.25a2.61 2.61 0 0 0 .5 2.66l.15.19c-.4.76-.94 1.78-1.4 2.58-1.27 2.2-2.24 3.95-2.97 3.95-.58 0-.57-1.77-.57-3.43 0-1.43.1-3.58.19-5.8.03-.74-.34-1.16-.96-1.54a4.33 4.33 0 0 0-1.64-.69c-.7 0-2.7.1-4.6 5.57-.23.69-.7 1.94-.7 1.94l.04-6.57c0-.16-.08-.3-.27-.4a4.68 4.68 0 0 0-1.93-.54c-.36 0-.54.17-.54.5l-.07 10.3c0 .78.02 1.69.1 2.09.08.4.2.72.36.91.15.2.33.34.62.4.28.06 1.78.25 1.86-.32.1-.69.1-1.43.89-4.2 1.22-4.31 2.82-6.42 3.58-7.16.13-.14.28-.14.27.07l-.22 5.32c-.2 5.37.78 6.36 2.17 6.36 1.07 0 2.58-1.06 4.2-3.74l2.7-4.5 1.58 1.46c1.28 1.2 1.7 2.36 1.42 3.45-.21.83-1.02 1.7-2.44.86-.42-.25-.6-.44-1.01-.71-.23-.15-.57-.2-.78-.04-.53.4-.84.92-1.01 1.55-.17.61.45.94 1.09 1.22.55.25 1.74.47 2.5.5 2.94.1 5.3-1.42 6.94-5.34.3 3.38 1.55 5.3 3.72 5.3 1.45 0 2.91-1.88 3.55-3.72.18.75.45 1.4.8 1.96 1.68 2.65 4.93 2.07 6.56-.18.5-.69.58-.94.58-.94a3.07 3.07 0 0 0 2.94 2.87c1.1 0 2.23-.52 3.03-2.31.09.2.2.38.3.56 1.68 2.65 4.93 2.07 6.56-.18l.2-.28.05 1.4-1.5 1.37c-2.52 2.3-4.44 4.05-4.58 6.09-.18 2.6 1.93 3.56 3.53 3.69a4.5 4.5 0 0 0 4.04-2.11c.78-1.15 1.3-3.63 1.26-6.08l-.06-3.56a28.55 28.55 0 0 0 5.42-9.44s.93.01 1.92-.05c.32-.02.41.04.35.27-.07.28-1.25 4.84-.17 7.88.74 2.08 2.4 2.75 3.4 2.75 1.15 0 2.26-.87 2.85-2.17l.23.42c1.68 2.65 4.92 2.07 6.56-.18.37-.5.58-.94.58-.94.36 2.2 2.07 2.88 3.05 2.88 1.02 0 2-.42 2.78-2.28.03.82.08 1.49.16 1.7.05.13.34.3.56.37.93.34 1.88.18 2.24.11.24-.05.43-.25.46-.75.07-1.33.03-3.56.43-5.21.67-2.79 1.3-3.87 1.6-4.4.17-.3.36-.35.37-.03.01.64.04 2.52.3 5.05.2 1.86.46 2.96.65 3.3.57 1 1.27 1.05 1.83 1.05.36 0 1.12-.1 1.05-.73-.03-.31.02-2.22.7-4.96.43-1.79 1.15-3.4 1.41-4 .1-.21.15-.04.15 0-.06 1.22-.18 5.25.32 7.46.68 2.98 2.65 3.32 3.34 3.32 1.47 0 2.67-1.12 3.07-4.05.1-.7-.05-1.25-.48-1.25Z" fill="#000000" fill-rule="evenodd"></path></svg>
              </figure>
              <ul>
                  <li><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"></path></svg><span>Home</span></li>
                  <li><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="16.511" x2="22" y1="16.511" y2="22"></line></svg><span>Search</span></li>
                  <li><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon><polygon fill-rule="evenodd" points="10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056"></polygon><circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle></svg><span>Explore</span></li>
                  <li><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="#000000" stroke-linejoin="round" stroke-width="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line><path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="M9.763 17.664a.908.908 0 0 1-.454-.787V11.63a.909.909 0 0 1 1.364-.788l4.545 2.624a.909.909 0 0 1 0 1.575l-4.545 2.624a.91.91 0 0 1-.91 0Z" fill-rule="evenodd"></path></svg><span>Reels</span></li>
                  <li><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="#000000" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="#000000" stroke-linejoin="round" stroke-width="2"></polygon></svg><span>Messages</span></li>
                  <li><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg><span>Notifications</span></li>
                  <li><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552Z" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line></svg><span>Create</span></li>
                  <!--PROFILE PICTURE OF USER-->
                  <li><figure><img src="{{imageSource}}" alt=""></figure><span>Profile</span></li>
              </ul>
              <div><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="3" x2="21" y1="4" y2="4"></line><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="3" x2="21" y1="12" y2="12"></line><line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="3" x2="21" y1="20" y2="20"></line></svg><span>More</span></div>
          </nav>
          <main>
              <!--instagram feed-->
              <div class="posts">
      
                  <!--hardcoded post used to replicate the feed ui-->
                  <div class="post">
                      <figure><img src="https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1547&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt=""></figure>
                      <div class="post-actions">
                          <div class="left-actions">
                              <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg></span>
                              <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="#000000" stroke-linejoin="round" stroke-width="2"></path></svg></span>
                              <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="#000000" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="#000000" stroke-linejoin="round" stroke-width="2"></polygon></svg></span>
                          </div>
                          <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon></svg></span>
                      </div>
                      <div class="likes"><span>13,924 likes</span></div>
                      <div class="author-info"><span class="user">tiffany_1123</span><span class="descr">Lately, I've been obsessed with these waffles! </span></div>
                      <div class="view-comments"><span>View all 826 comments</span></div>
                      <div class="add-comment"><span>Add a comment</span><svg fill="#dbdbdb" height="13" role="img" viewBox="0 0 24 24" width="13"><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg></div>
                      <hr class="comment-line"/>
                  </div>
      
                  <!--First ad shown in the feed-->
                  <div class="post">
                      <div class="post-top-info">
                          <div class="post-icon-info">
                              <!--ADVERTISER ICON OF FIRST AD-->
                              <figure><img src="{{firstAd}}" alt=""></figure>
                              <div class="main-advertiser-name">
                                  <span>{{companyName}}</span><!--ADVERTISER NAME OF FIRST AD-->
                                  <span>Recommended for you</span>
                              </div>
                          </div>
                          <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg></span>
                      </div>
                      <!--FIRST AD IMG-->
                      <figure><img src="{{firstAd}}" alt=""></figure>
                      <div class="post-actions">
                          <div class="left-actions">
                              <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg></span>
                              <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="#000000" stroke-linejoin="round" stroke-width="2"></path></svg></span>
                              <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="#000000" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="#000000" stroke-linejoin="round" stroke-width="2"></polygon></svg></span>
                          </div>
                          <span><svg fill="#000000" height="24" role="img" viewBox="0 0 24 24" width="24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon></svg></span>
                      </div>
                      <div class="likes"><span>13,924 likes</span></div>
                      <div class="author-info"><span class="user">tiffany_1123</span><span class="descr">Lately, I've been obsessed with these waffles! </span></div>
                      <div class="view-comments"><span>View all 826 comments</span></div>
                      <div class="add-comment"><span>Add a comment</span><svg fill="#dbdbdb" height="13" role="img" viewBox="0 0 24 24" width="13"><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg></div>
                      <hr class="comment-line"/>
                  </div>
              </div>
              <div class="more-ads">
                  <h3>Recommended products</h3>
                  <!--SECOND AD IMG-->
                  <figure class="ad"><img src="{{secondAd}}" alt=""></figure>
                  <!--THIRD AD IMG-->
                  <figure class="ad"><img src="{{thirdAd}}" alt=""></figure>
              </div>
          </main>
      </body>
      </html>
      `
    })
  })
  .then(() => {
    console.log('Image7 successfully created.');
  
    // Upload image5 to Firebase Storage
    return bucket.upload(image7FilePath, { destination: `images/${image7FileName}` });
  })
  .then(() => {
    console.log('Image7 successfully uploaded to Firebase Storage.');
  })
  .catch((err) => {
    console.error('Error creating or uploading image5:', err);
    return res.sendStatus(500); // Respond with error status
  });

  // Prepare new data
  const newData = { age, gender, emotion, picture: `images/${imgFileName}` };

  // Save data to Firestore
  db.collection('faceData').add(newData)
    .then(() => {
      console.log('Data successfully stored in Firestore.');
      res.sendStatus(200); // Respond with success status
    })
    .catch((err) => {
      console.error('Error storing data in Firestore:', err);
      return res.sendStatus(500); // Respond with error status
    });
});



// userinputdata json file 
const bodyParser = require('body-parser');
const { error, log } = require('console');


// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to save user information
app.post('/saveUserInfo', (req, res) => {
    const userInfo = req.body;

    // Write user info to userinfo.json
    fs.writeFile('userinfo.json', JSON.stringify(userInfo, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save user info' });
        }
        res.status(200).json({ message: 'User info saved successfully' });
    });
});




// Start the server on port 3000
app.listen(3000, function () {
  console.log('Server is running on http://localhost:3000');
});
