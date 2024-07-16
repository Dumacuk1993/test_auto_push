import React from 'react';
import './Article.css';

const Article = ({ html }) => {
  return (
    <div className='article'>
        <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export default Article