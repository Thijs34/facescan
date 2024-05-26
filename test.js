const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const https = require('https');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const nodeHtmlToImage = require('node-html-to-image'); // Add this line

// Load your service account key JSON file
let serviceAccount = require('./test.json');
const { log } = require('console');

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

// Endpoint to receive and store data
app.post('/storeData', function (req, res) {
  const { age, gender, emotion, picture } = req.body;

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

  // Variables needed for Image 2
  const image2FileName = "2.png"; //Filename for the image
  const image2FilePath = path.join(__dirname, 'images', image2FileName); //Path for the image
  // vars for image 3 - tiktok profile
  const image3FileName = "3.png"; // Filename for the image
  const image3FilePath = path.join(__dirname, 'images', image3FileName); // Path for the image
  const profilepic = 'data:image/jpeg;base64,' + base64Data; //Data used to import the profilepicture (image 1)
  const ScannerAge = req.body.age; //Get the users age based on scanner
  const currentMood = req.body.emotion//Get the users current mood based on the scan
  var MoodResponse = ""

  if (currentMood == "happy") {
    MoodResponse = "I am happy right now"
  } else {
    MoodResponse = "I am anything but happy"
  }


  // Upload new image to Firebase Storage
  bucket.upload(imgFilePath, { destination: `images/${imgFileName}` })
  .then(() => {
    console.log('New image successfully uploaded to Firebase Storage.');

    return nodeHtmlToImage({
      content: { imageSource: profilepic, agescanner: ScannerAge, mood: MoodResponse },//set the imageSource to the profilepic var
      output: image2FilePath,
      html: `
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
    
    // Tiktok profile
    // Create a png from an html template with nodeHtmlToImage library
    return nodeHtmlToImage({
      content: { imageSource: profilepic }, //set the imageSource to the profilepic var
      output: image3FilePath,
      html: `
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
            height: 681px;
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
                  <img src="img/tiktok/reel-placeholder.jpg" alt="">
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
                              <span class="author-username">author_of_reel</span>
                              <!--NAME OF USER-->
                              <span class="author-name">Author name</span>
                          </div>
                      </div>
                      <button class="follow-btn">Follow</button>
                  </div>
                  <p class="reel-description">Look at how embarrassing of a human being I am &#129322;<span class="hashtags">#iAmALoser #cringe #laughable #otherHashtag #anotherHashtag</span></p>
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
                              <span class="comment-content">Hahahaha indeed very pathetic, you should be ashamed &#129315;</span>
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
                              <span class="comment-content">Yikes</span>
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

    // Upload image2 to Firebase Storage
    return bucket.upload(image3FilePath, { destination: `images/${image3FileName}` });
  })
  .then(() => {
    console.log('Image3 successfully uploaded to Firebase Storage.');
  })
  .catch((err) => {
    console.error('Error creating or uploading image2 or image3:', err);
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

// Start the server on port 3000
app.listen(3000, function () {
  console.log('Server is running on http://localhost:3000');
});