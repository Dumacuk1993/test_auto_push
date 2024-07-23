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
  const [title, setTitle] = useState('');
  const [imageThumb, setImageThumb] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editId, setEditId] = useState(null);
  const [openEditor, setOpenEditor] = useState(false);
  const quillRef = useRef(null);

  const handleImageInsert = () => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    
    if (range && imageUrl) {
      quill.insertEmbed(range.index, 'image', { url: imageUrl });
      setImageUrl('');
    }
  };

  const currentDate = () => {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }

    return `${day}.${month}.${year}`;
  }

  const handleSave = () => {
    const payload = {
      date: currentDate(),
      editorHtml: editorHtml,
      logo: selectedProduct,
      title, 
      image: imageThumb
    };

    if (editId) {
      // Обновление статьи
      axios.put(`/update-data/${editId}`, payload)
        .then(response => {
          console.log('Server response:', response.data);
          alert('Data updated and pushed to GitHub');
          clearForm();
        })
        .catch(error => {
          console.error('There was an error!', error);
          alert('There was an error: ' + error.message);
        });
    } else {
      // Сохранение новой статьи
      axios.post('/save-data', payload)
        .then(response => {
          console.log('Server response:', response.data);
          alert('Data saved and pushed to GitHub');
          clearForm();
        })
        .catch(error => {
          console.error('There was an error!', error);
          alert('There was an error: ' + error.message);
        });
    }
  };

  const handleEdit = (article) => {
    setEditorHtml(article.html_template);
    setTitle(article.title);
    setImageThumb(article.image);
    setSelectedProduct(article.logo);
    setEditId(article.id);
    setOpenEditor(true)
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      axios.delete(`/delete-data/${id}`)
        .then(response => {
          console.log('Server response:', response.data);
          alert('Data deleted and pushed to GitHub');
          clearForm();
        })
        .catch(error => {
          console.error('There was an error!', error);
          alert('There was an error: ' + error.message);
        });
    }
  };

  const clearForm = () => {
    setEditorHtml('');
    setTitle('');
    setImageThumb('');
    setSelectedProduct('');
    setImageUrl('');
    setEditId(null);
    setOpenEditor(false)
  };

  return (
    <div className='article-editor'>
      <button onClick={() => setOpenEditor(!openEditor)}>Добавить статью</button>
      <div className='article-editor-wrapper' style={{ display: openEditor ? 'block' : 'none' }}>
        <h1 className='new_article-title'>{editId ? 'Редактирование статьи' : 'Новая статья'}</h1>
        <input 
          type="text" 
          placeholder="Введите Заголовок статьи" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Введите URL изображения превью" 
          value={imageThumb}
          onChange={(e) => setImageThumb(e.target.value)}
        />
        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
          <option value="">Выберите продукт</option>
          <option value="PAD">PAD</option>
          <option value="SCR">SCR</option>
          <option value="ED">ED</option>
        </select>
        <div>
          <ReactQuill
            ref={quillRef}
            value={editorHtml}
            onChange={setEditorHtml}
          />
        </div>
        <input 
          type="text" 
          placeholder="Введите URL изображения" 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button onClick={handleImageInsert}>Вставить изображение</button>
        <button onClick={handleSave}>{editId ? 'Обновить статью' : 'Опубликовать статью'}</button>
      </div>
      <div>
        <h3 style={{ fontSize: '28px' }}>{!dataNews?.length ? 'Нет опубликованных статей' : 'Опубликованные статьи'}</h3>
        {dataNews?.map(item => (
          <div key={item.id} className='article_preview'>
            <Article item={item} />
            <div className='article-buttons'>
              <button onClick={() => handleEdit(item)}>Редактировать статью</button>
              <button onClick={() => handleDelete(item.id)}>Удалить статью</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleEditor;