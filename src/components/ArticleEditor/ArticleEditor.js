// import React, { useState, useRef } from 'react';
// import ReactQuill from 'react-quill';
// import Quill from 'quill';
// import 'react-quill/dist/quill.snow.css';
// import './ArticleEditor.css';
// import Article from '../Article/Article';
// import axios from 'axios';

// const ImageBlot = Quill.import('formats/image');

// class CustomImageBlot extends ImageBlot {
//   static create(value) {
//     const node = super.create(value);
//     node.setAttribute('src', value.url);
//     node.setAttribute('alt', value.alt || '');
//     return node;
//   }

//   static value(node) {
//     return {
//       url: node.getAttribute('src'),
//       alt: node.getAttribute('alt'),
//     };
//   }
// }

// CustomImageBlot.blotName = 'image';
// CustomImageBlot.tagName = 'img';
// Quill.register(CustomImageBlot);

// const ArticleEditor = () => {
//   const [editorHtml, setEditorHtml] = useState('');
//   const quillRef = useRef(null);

//   const handleImageUpload = () => {
//     const input = document.createElement('input');
//     input.setAttribute('type', 'file');
//     input.setAttribute('accept', 'image/*');
//     input.click();

//     input.onchange = async () => {
//       const file = input.files[0];
//       const reader = new FileReader();

//       reader.onload = (e) => {
//         const quill = quillRef.current.getEditor();
//         const range = quill.getSelection();
        
//         if (range) {
//           const url = e.target.result;
//           quill.insertEmbed(range.index, 'image', { url });
//         }
//       };

//       reader.readAsDataURL(file);
//     };
//   };

//   const handleSave = () => {
//     const payload = {
//       editorHtml: editorHtml
//     };

//     console.log('Sending data:', payload);

//     axios.post('/save-data', payload)
//       .then(response => {
//         console.log('Server response:', response.data);
//         alert('Data saved and pushed to GitLab');
//       })
//       .catch(error => {
//         console.error('There was an error!', error);
//         alert('There was an error: ' + error.message);
//       });
//   };

//   return (
//     <div className='article-editor'>
//       <button onClick={handleImageUpload}>Загрузить изображение</button>
//       <div>
//         <ReactQuill
//           ref={quillRef}
//           value={editorHtml}
//           onChange={setEditorHtml}
//         />
//       </div>
//       <button onClick={handleSave}>Опубликовать статью</button>

//       <Article html={editorHtml}/>
//     </div>
//   );
// };

// export default ArticleEditor;

import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import Quill from 'quill';
import 'react-quill/dist/quill.snow.css';
import './ArticleEditor.css';
import Article from '../Article/Article';
import axios from 'axios';
import dataNews from '../../data';

const ImageBlot = Quill.import('formats/image');

class CustomImageBlot extends ImageBlot {
  static create(value) {
    const node = super.create(value);
    node.setAttribute('src', value.url);
    node.setAttribute('alt', value.alt || '');
    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute('src'),
      alt: node.getAttribute('alt'),
    };
  }
}

CustomImageBlot.blotName = 'image';
CustomImageBlot.tagName = 'img';
Quill.register(CustomImageBlot);

const ArticleEditor = () => {
  const [editorHtml, setEditorHtml] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const quillRef = useRef(null);

  const handleImageInsert = () => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    
    if (range && imageUrl) {
      quill.insertEmbed(range.index, 'image', { url: imageUrl });
      setImageUrl('');
    }
  };
console.log(editorHtml);
  const handleSave = () => {
    const payload = {
      editorHtml: editorHtml,
      logo: 'url'
    };

    console.log('Sending data:', payload);

    axios.post('/save-data', payload)
      .then(response => {
        console.log('Server response:', response.data);
        alert('Data saved and pushed to GitLab');
      })
      .catch(error => {
        console.error('There was an error!', error);
        alert('There was an error: ' + error.message);
      });
  };

  return (
    <div className='article-editor'>
      <input 
        type="text" 
        placeholder="Введите URL изображения" 
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button onClick={handleImageInsert}>Вставить изображение</button>
      <div>
        <ReactQuill
          ref={quillRef}
          value={editorHtml}
          onChange={setEditorHtml}
        />
      </div>
      <button onClick={handleSave}>Опубликовать статью</button>
      {dataNews?.map(item => {
        return <Article html={item.html_template} />
      })}
    </div>
  );
};

export default ArticleEditor;