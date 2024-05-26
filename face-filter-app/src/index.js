import * as deepar from "deepar";
import axios from 'axios';

console.log("Deepar version: " + deepar.version);
// Top-level await is not supported.
// So we wrap the whole code in an async function that is called immediatly.
(async function () {
    // Get the element you want to place DeepAR into. DeepAR will inherit its width and height from this and fill it.
    const previewElement = document.querySelector('#deepar-div');
  
    // reference to the paths of the filter effects
    const effectList = [
        'effects/MakeupLook.deepar',
        'effects/Stallone.deepar'
    ];

  
    let deepAR = null;
    let isScreenshotTaken = false; // bool to control prevent taking multiple screenshots
  
    // Initialize DeepAR with an effect file.
    try {
      deepAR = await deepar.initialize({
        licenseKey: "ad4e1fa985176de359d59293f88bc5abe4a624a6b93ef999e9414c5766c66b544f720fef7e565d61",
        previewElement,
        effect: effectList[1],
        // Removing the rootPath option will make DeepAR load the resources from the JSdelivr CDN,
        // which is fine for development but is not recommended for production since it's not optimized for performance and can be unstable.
        // More info here: https://docs.deepar.ai/deepar-sdk/platforms/web/tutorials/download-optimizations/#custom-deployment-of-deepar-web-resources
        // rootPath: "./deepar-resources",
        // additionalOptions: {
        //   cameraConfig: {
        //     // facingMode: 'environment'  // uncomment this line to use the rear camera
        //   },
        // },
      });
      // check if face is tracked and take a screenshot if it is
      // deepAR.callbacks.onFaceVisibilityChanged = (visible) => {
      //   if (visible) {
      //     console.log("Face visible!");
      //   } 
      // };
      // const image = await deepAR.takeScreenshot(); // take a screenshot in data url format
      //   // Send the image data to the server
      // try {
      //   const response = await axios.post('http://localhost:3000/save-image', {
      //     image
      //   });
      //   console.log('Image sent from index.js', response.data);
      // } catch (err) {
      //   console.error('Error in index.js saving image:', err);
      // }

      async function handleFaceVisibility(visible) {
        if (visible && !isScreenshotTaken) {
            console.log("Face visible!");
            isScreenshotTaken = true; // prevent multiple screenshots
            try {
                const image = await deepAR.takeScreenshot(); // take a screenshot in data url format
                // Send the image data to the server
                try {
                    const response = await axios.post('http://localhost:3000/save-image', {
                        image
                    });
                    console.log('Image sent from index.js', response.data);
                } catch (err) {
                    console.error('Error in index.js saving image:', err);
                  }
            } catch (error) {
                console.error('Error taking screenshot:', error);
            }
        }
        // else if (!visible) {
        //   isScreenshotTaken = false; // Reset flag when face is not visible
        // }
    }

    deepAR.callbacks.onFaceVisibilityChanged = (visible) => {
      handleFaceVisibility(visible, isScreenshotTaken);
    };

    } catch (error) {
      console.error('Error in async function: ', error);
      return;
    }
})();

// "build": "rm -rf dist && webpack --config webpack.config.js --mode production && cp -r public/* dist && cp -r node_modules/deepar dist/deepar-resources",

// npm install -D webpack-dev-server
// npm install webpack webpack-cli webpack-dev-server --save-dev
// however you only need npm install now, to run use npm run dev
// npm install process
// npm install express body-parser
// npm install axios      for making http requests
// npm install cors       allow cross-origin requests
// to run the server: cd VREXP\vr\face\face-filter-app\src> node server.js
// to run the filter cd app: VREXP\vr\face\face-filter-app> npm run dev


