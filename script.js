import * as deepar from 'https://cdn.jsdelivr.net/npm/deepar/js/deepar.esm.js';


//import axios from 'axios'; // to allow http requests

const video = document.getElementById('video');
let isCameraActive = false;
// let cameraStream; // used by both the faceapi and deepar

// Top-level await is not supported.
// So we wrap the whole code in an async function that is called immediatly.
(async function () {
  // Get the element you want to place DeepAR into. DeepAR will inherit its width and height from this and fill it.
  const previewElement = document.querySelector('#deep-ar-filters');

  // reference to the paths of the filter effects
  const effectList = [
      'effects/MakeupLook.deepar',
      'effects/Stallone.deepar',
      'effects/Neon_Devil_Horns.deepar',
      'effects/Vendetta_Mask.deepar'
  ];


  let deepAR = null;
  let isScreenshotTaken = false; // bool to control prevent taking multiple screenshots

  // Initialize DeepAR with an effect file.
  try {
    deepAR = await deepar.initialize({
      licenseKey: "ad4e1fa985176de359d59293f88bc5abe4a624a6b93ef999e9414c5766c66b544f720fef7e565d61",
      previewElement,
      effect: effectList[1], // initialize deepar with the stallone filter
    });

    async function handleFaceVisibility(visible) {
      if (visible && !isScreenshotTaken) {
          console.log("Face visible!");
          isScreenshotTaken = true; // prevent multiple screenshots
          try {
              const image = await deepAR.takeScreenshot(); // take a screenshot of stallone filter in data url format
              // switch the filter to take the second image
              await deepAR.switchEffect(effectList[0]);
              const image2 = await deepAR.takeScreenshot(); // makeup filter screenshot
              await deepAR.switchEffect(effectList[2]);
              const image3 = await deepAR.takeScreenshot(); // devil horns filter screenshot
              await deepAR.switchEffect(effectList[3]);
              const image4 = await deepAR.takeScreenshot(); // vendetta mask filter screenshot
              // Send the image data to the server
              fetch('http://localhost:3000/save-image', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*', // CORS header to allow cross-origin requests
                },
                body: JSON.stringify({
                  filterImg: image,
                  filterImg2: image2,
                  filterImg3: image3,
                  filterImg4: image4
                })
              })
              .then(res => res.json())
              .then(data => console.log('Fetch req for filter image successful: ', data))
              .catch(err => console.error('Error sending filter img: ', err))
              // try {
              //     const response = await axios.post('https://localhost:3000/save-image', {
              //         image
              //     });
              //     console.log('Image sent from index.js', response.data);
              // } catch (err) {
              //     console.error('Error in index.js saving image:', err);
              //   }
          } catch (error) {
              console.error('Error taking screenshot:', error);
          }
      }
  }

  deepAR.callbacks.onFaceVisibilityChanged = (visible) => {
    handleFaceVisibility(visible, isScreenshotTaken);
  };

  } catch (error) {
    console.error('Error in async function: ', error);
    return;
  }
})();

async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
  ]);
  document.getElementById('start').disabled = false;
  loadVideo();
  isCameraActive = false;
}

loadModels();

function loadVideo() {
  navigator.mediaDevices.getUserMedia({ video: { aspectRatio: 1.55 }, audio: false })
    .then((cameraStream) => {
      video.srcObject = cameraStream;
      video.oncanplay = () => {
        isCameraActive = false;
      };
    })
    .catch(console.error);
}

// Create a tooltip element
var tooltip = document.createElement('div');
tooltip.id = 'tooltip';
tooltip.style.visibility = 'hidden';
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = '#555';
tooltip.style.color = '#fff';
tooltip.style.textAlign = 'center';
tooltip.style.borderRadius = '6px';
tooltip.style.padding = '5px 0';
tooltip.style.zIndex = '1';
document.body.appendChild(tooltip);

// Add mouseover and mouseout events to the buttons
var buttons = {
  'start': 'Wait for the scan to be done',
  'Next': 'Scan first before pressing next'
};
for (var id in buttons) {
  var button = document.getElementById(id);
  button.addEventListener('mouseover', function(e) {
    if (e.target.disabled) {
      tooltip.textContent = buttons[e.target.id];
      tooltip.style.visibility = 'visible';
      tooltip.style.left = e.pageX + 'px';
      tooltip.style.top = (e.pageY - tooltip.offsetHeight) + 'px';
    }
  });
  button.addEventListener('mouseout', function() {
    tooltip.style.visibility = 'hidden';
  });
}

document.getElementById('start').addEventListener('click', startScanning);
document.getElementById('Next').disabled = true;

async function startScanning() {
  const startButton = document.getElementById('start');
  const nextButton = document.getElementById('Next'); // Get the "Next" button
  if (!isCameraActive) {
    isCameraActive = true;
    startButton.disabled = true; // disable the start button
    nextButton.disabled = true; // disable the "Next" button while scanning
    const videoContainer = document.getElementById('videoContainer');
    const canvas = faceapi.createCanvasFromMedia(video);
    videoContainer.append(canvas);
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
    faceapi.matchDimensions(canvas, displaySize);
    const detectFaces = async () => {
      if (!isCameraActive) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      const detection = resizedDetections[0];
      if (detection) {
        const { age, gender, expressions } = detection;
        const maxEmotion = Object.keys(expressions).reduce((a, b) => (
          expressions[a] > expressions[b] ? a : b
        ));
        const data = { age: Math.round(age), gender, emotion: maxEmotion };
        localStorage.setItem('latestData', JSON.stringify(data));
        const box = detection.detection.box;
        const label = `${Math.round(detection.age)} years old ${detection.gender}`;
        new faceapi.draw.DrawBox(box, { label }).draw(canvas);
        document.getElementById('idCard').style.display = 'block';
        document.getElementById('age').innerText = `Age: ${Math.round(detection.age)}`;
        document.getElementById('gender').innerText = `Gender: ${detection.gender}`;
        document.getElementById('emotion').innerText = `Emotion: ${maxEmotion}`;
      }
      window.requestAnimationFrame(detectFaces);
    };

    await detectFaces();
    setTimeout(() => {
      isCameraActive = false;
      startButton.disabled = false; // enable the start button
      nextButton.disabled = false; // enable the "Next" button after scanning
      startButton.textContent = 'Scan Again';
      setTimeout(sendDataToServer, 200);
    }, 7000);
  }
}







function sendDataToServer() {
  const latestData = JSON.parse(localStorage.getItem('latestData'));
  if (latestData) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const picture = canvas.toDataURL('image/png');
    latestData.picture = picture;

    fetch('/storeData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(latestData)
    })
    .then(response => response.ok ? console.log('Data sent to server successfully.') : Promise.reject('Failed to send data to server.'))
    .catch(error => console.error('Error sending data to server:', error));
  }
}

function initializeIdCard() {
  document.getElementById('idCard').style.display = 'block';
  document.getElementById('age').innerText = 'Age: ';
  document.getElementById('gender').innerText = 'Gender: ';
  document.getElementById('emotion').innerText = 'Emotion: ';
}

window.onload = initializeIdCard;
