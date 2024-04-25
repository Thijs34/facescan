const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const https = require('https');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

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

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to receive and store data
app.post('/storeData', function(req, res) {
  const { age, gender, emotion, picture } = req.body;

  // Convert base64 image to binary
  const base64Data = picture.replace(/^data:image\/png;base64,/, '');
  const imgFileName = "1.png"; // Always set the filename as "1.png"
  const imgFilePath = path.join(__dirname, 'images', imgFileName);

  // Save image to file
  fs.writeFileSync(imgFilePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving image:', err);
      res.sendStatus(500); // Respond with error status
      return;
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
      res.sendStatus(500); // Respond with error status
    });

  // Upload new image to Firebase Storage
  bucket.upload(imgFilePath, { destination: `images/${imgFileName}` })
    .then(() => {
      console.log('New image successfully uploaded to Firebase Storage.');
    })
    .catch((err) => {
      console.error('Error uploading new image to Firebase Storage:', err);
      res.sendStatus(500); // Respond with error status
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
      res.sendStatus(500); // Respond with error status
    });
});

// Start the server on port 3000
app.listen(3000, function() {
  console.log('Server is running on http://localhost:3000');
});
