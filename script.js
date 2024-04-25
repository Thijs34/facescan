const video = document.getElementById('video');
let isCameraActive = false;

async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
  ]);
  loadVideo();
}

loadModels();

function loadVideo() {
  navigator.mediaDevices.getUserMedia({ video: { aspectRatio: 0.75 }, audio: false })
    .then((cameraStream) => {
      video.srcObject = cameraStream;
      return new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
    })
    .catch(console.error);
}

document.getElementById('start').addEventListener('click', startScanning);

async function startScanning() {
  isCameraActive = true;
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
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
    window.requestIdleCallback(detectFaces);
  };

  await detectFaces();
  setTimeout(() => {
    isCameraActive = false;
    setTimeout(sendDataToServer, 2000);
  }, 7000);
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
