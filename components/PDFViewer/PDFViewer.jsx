import React from 'react';
import Style from './PDFViewer.module.css';

const PDFViewer = ({ pdfUrl, onClose }) => {
  return (
    <div className={Style.modal_overlay}>
      <div className={Style.modal_content}>
        <button 
          className={Style.close_button}
          onClick={onClose}
        >
          ×
        </button>
        <iframe
          src={pdfUrl}
          title="PDF viewer"
          className={Style.pdf_frame}
        />
      </div>
    </div>
  );
};

export default PDFViewer; 