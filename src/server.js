const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const simpleGit = require('simple-git');

const app = express();
const git = simpleGit();

app.use(bodyParser.json());

app.post('/save-data', (req, res) => {
  const data = req.body.data;

  fs.writeFile('data.txt', data, (err) => {
    if (err) {
      return res.status(500).send('Error writing to file');
    }

    git.add('./*')
      .then(() => git.commit('Auto-commit'))
      .then(() => git.push('origin', 'main'))
      .then(() => res.send('Data saved and pushed to GitLab'))
      .catch((err) => res.status(500).send('Error with git operations: ' + err));
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});