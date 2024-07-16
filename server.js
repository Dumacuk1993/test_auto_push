const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const git = simpleGit();

app.use(bodyParser.json());

app.post('/save-data', (req, res) => {
  const { editorHtml } = req.body;

  if (!editorHtml) {
    console.error('editorHtml is missing');
    return res.status(400).send('editorHtml is missing');
  }

  const filePath = path.join(__dirname, 'src', 'data.js');

  fs.readFile(filePath, 'utf8', (err, fileContent) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error reading file', err);
      return res.status(500).send('Error reading file');
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
        return res.status(500).send('Error parsing file content');
      }
    }

    currentData.push(editorHtml);

    const newData = `const dataNews = ${JSON.stringify(currentData, null, 2)};
    
    export default dataNews;`;

    fs.writeFile(filePath, newData, (err) => {
      if (err) {
        console.error('Error writing to file', err);
        return res.status(500).send('Error writing to file');
      }

      git.add('./*')
        .then(() => git.commit('Auto-commit'))
        .then(() => git.push('origin', 'main'))
        .then(() => res.send('Data saved and pushed to GitLab'))
        .catch((err) => {
          console.error('Error with git operations', err);
          res.status(500).send('Error with git operations: ' + err);
        });
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

