const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express(); // create a server instance
const port = 3000; // specify the port where the server will be hosted

app.use(cors()); // cors adds headers to allow cross-platform requests

app.use(bodyParser.json({ limit: '20mb' })); // use body-parser package to parse json requests

// async function saveFilterImg(dataUrl){
//     console.log('Enter the saveFilterImg function, successful import');
//     const base64Data = dataUrl.replace(/^data:image\/png;base64,/, ''); // remove the 'data:image/png;base64,' string from the data url screenshot
//     const screenshotName = 'filter-img.png';
//     const screenshotFilePath = path.join(__dirname, '../public/images', screenshotName);

//     try {
//         fs.writeFileSync(screenshotFilePath, base64Data, 'base64');
//         console.log('Filter image saved successfully:', screenshotFilePath);
//     } catch (err) {
//         console.error('Error saving filter image:', err);
//         throw err;
//     }
// }


// app.post('/save-image', (req, res) => {
//     const { image } = req.body;
//     const base64Data = image.replace(/^data:image\/png;base64,/, '');
//     const screenshotName = 'filter-img.png';
//     const screenshotFilePath = path.join(__dirname, 'public/images', screenshotName);
  
//     fs.writeFileSync(screenshotFilePath, base64Data, 'base64', (err) => {
//       if (err) {
//         console.error('Error saving filter image:', err);
//         return res.status(500).send('Error saving image');
//       }
//       res.send('Filter image saved successfully');
//     });
// });

app.post('/save-image', (req, res) => {
    const { image } = req.body;
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const screenshotName = 'filter-img.png';
    const screenshotFilePath = path.join(__dirname, '../public/images', screenshotName || 'filter-img.png');
  
    fs.writeFile(screenshotFilePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Error saving image:', err);
        return res.sendStatus(500);
      }
      console.log('Image saved successfully:', screenshotFilePath);
      res.status(200).send({ message: 'Image saved successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});



// const base64Data = image.replace(/^data:image\/png;base64,/, ''); // remove the 'data:image/png;base64,' string from the data url screenshot
// const screenshotName = 'filter-img.png';
// const screenshotFilePath = path.join(__dirname, '../public/images', screenshotName);
// /**
//  * write the file to disk
//  * @param screenshotFilePath - type: string; the path of the image, along with its name, relative to the directory of the index.js
//  *        base64Data - type: string; the data inside the written file
//  *        'base64' - type: string; additinal information about the type of encoding
//  *        err - callback function
//  */
// fs.writeFileSync(screenshotFilePath, base64Data, 'base64', (err) => {
//     if (err) {
//         console.error('Error saving image:', err);
//         return res.sendStatus(500); // Respond with error status
//     }
// });