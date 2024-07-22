const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');

const app = express();
const git = simpleGit();

app.use(bodyParser.json({}));

const filePath = path.join(__dirname, 'src', 'data.js');

const readDataFromFile = (callback) => {
  fs.readFile(filePath, 'utf8', (err, fileContent) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error reading file', err);
      return callback(err);
    }

    let currentData = [];
    if (fileContent) {
      try {
        const match = fileContent.match(/const dataNews = (\[.*\]);/s);
        if (match && match[1]) {
          currentData = JSON.parse(match[1]);
        }
      } catch (err) {
        console.error('Error parsing file content', err);
        return callback(err);
      }
    }

    callback(null, currentData);
  });
};

const writeDataToFile = (data, callback) => {
  const newData = `const dataNews = ${JSON.stringify(data, null, 2)};\n\nexport default dataNews;`;

  fs.writeFile(filePath, newData, (err) => {
    if (err) {
      console.error('Error writing to file', err);
      return callback(err);
    }

    git.add('./*')
      .then(() => git.commit('Auto-commit'))
      .then(() => git.push('origin', 'main'))
      .then(() => callback(null))
      .catch((err) => {
        console.error('Error with git operations', err);
        callback(err);
      });
  });
};

app.post('/save-data', (req, res) => {
  const { date, logo, editorHtml, title, image } = req.body;

  if (!editorHtml) {
    console.error('editorHtml is missing');
    return res.status(400).send('editorHtml is missing');
  }

  readDataFromFile((err, currentData) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }

    currentData.push({
      id: uuidv4(), 
      html_template: editorHtml, 
      date,
      logo,
      title, 
      image
    });

    writeDataToFile(currentData, (err) => {
      if (err) {
        return res.status(500).send('Error writing to file');
      }

      res.send('Data saved and pushed to GitHub');
    });
  });
});

app.put('/update-data/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date, logo, editorHtml, title, image } = req.body;

  readDataFromFile((err, currentData) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }

    const index = currentData.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).send('Data not found');
    }

    currentData[index] = {
      id,
      html_template: editorHtml, 
      date,
      logo,
      title, 
      image
    };

    writeDataToFile(currentData, (err) => {
      if (err) {
        return res.status(500).send('Error writing to file');
      }

      res.send('Data updated and pushed to GitHub');
    });
  });
});

app.delete('/delete-data/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  readDataFromFile((err, currentData) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }

    const newData = currentData.filter(item => item.id !== id);

    if (newData.length === currentData.length) {
      return res.status(404).send('Data not found');
    }

    writeDataToFile(newData, (err) => {
      if (err) {
        return res.status(500).send('Error writing to file');
      }

      res.send('Data deleted and pushed to GitHub');
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server', err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const path = require('path');
// const simpleGit = require('simple-git');

// const app = express();
// const git = simpleGit();

// app.use(bodyParser.json({}));

// app.post('/save-data', (req, res) => {
//   const { date, logo, editorHtml, title, image } = req.body;

//   if (!editorHtml) {
//     console.error('editorHtml is missing');
//     return res.status(400).send('editorHtml is missing');
//   }

//   const filePath = path.join(__dirname, 'src', 'data.js');

//   fs.readFile(filePath, 'utf8', (err, fileContent) => {
//     if (err && err.code !== 'ENOENT') {
//       console.error('Error reading file', err);
//       return res.status(500).send('Error reading file');
//     }

//     let currentData = [];
//     if (fileContent) {
//       try {
//         const match = fileContent.match(/const dataNews = (\[.*\]);/s);
//         if (match && match[1]) {
//           currentData = JSON.parse(match[1]);
//         }
//       } catch (err) {
//         console.error('Error parsing file content', err);
//         return res.status(500).send('Error parsing file content');
//       }
//     }

//     currentData.push({
//       html_template: editorHtml, 
//       date,
//       logo,
//       title, 
//       image
//     });

//     const newData = `const dataNews = ${JSON.stringify(currentData, null, 2)};
    
//     export default dataNews;`;

//     fs.writeFile(filePath, newData, (err) => {
//       if (err) {
//         console.error('Error writing to file', err);
//         return res.status(500).send('Error writing to file');
//       }

//       git.add('./*')
//         .then(() => git.commit('Auto-commit'))
//         .then(() => git.push('origin', 'main'))
//         .then(() => res.send('Data saved and pushed to GitLab'))
//         .catch((err) => {
//           console.error('Error with git operations', err);
//           res.status(500).send('Error with git operations: ' + err);
//         });
//     });
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, (err) => {
//   if (err) {
//     console.error('Failed to start server', err);
//   } else {
//     console.log(`Server is running on port ${PORT}`);
//   }
// });

