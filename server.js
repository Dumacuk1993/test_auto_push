const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const simpleGit = require('simple-git');

const app = express();
const git = simpleGit();

// Middleware для парсинга JSON
app.use(bodyParser.json());

app.post('/save-data', (req, res) => {
  let data = req.body.data;

  // Логирование данных для отладки
  console.log('Received data:', data);

  // Проверка на undefined
  if (data === undefined) {
    console.error('Data is undefined');
    return res.status(400).send('Data is undefined');
  }

  // Проверка типа данных и преобразование из JSON-строки
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      console.error('Invalid JSON string');
      return res.status(400).send('Invalid JSON string');
    }
  }

  // Добавление содержимого editorHtml в файл
  fs.appendFile('data.txt', data.editorHtml + '\n', (err) => {
    if (err) {
      console.error('Error appending to file', err);
      return res.status(500).send('Error appending to file');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server', err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});