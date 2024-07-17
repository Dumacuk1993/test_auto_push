import React from 'react';
import './Article.css';

const Article = ({ item }) => {
  return (
    <div className='article'>
        <span>{ item.date }</span>
        <h1>{ item.title }</h1>
        <span>{ item.logo }</span>
        <div dangerouslySetInnerHTML={{ __html: item.html_template }} />
    </div>
  )
}

export default Article