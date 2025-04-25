import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./DropZone.module.css";
import images from "../../img";
import { PDFViewer } from "../../components/componentsindex.js";

const PDFIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
    <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
    <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
  </svg>
);

const DropZone = ({
  title,
  heading,
  subHeading,
  name,
  website,
  description,
  royalties,
  fileSize,
  category,
  properties,
  uploadToIPFS,
  uploadToPinata,
  setImage,
}) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileSize, setUploadedFileSize] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFile) => {
    try {
      const file = acceptedFile[0];
      setIsLoading(true);
      setFileType(file.type);
      setUploadedFileSize(formatFileSize(file.size));
      
      // Upload to Pinata
      const url = await uploadToPinata(file);
      if (url) {
        setFileUrl(url);
        setImage(url);
        console.log("File uploaded:", url);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 100000000, // 100MB in bytes
    multiple: false
  });

  return (
    <div className={Style.DropZone}>
      <div className={`${Style.DropZone_box} ${isDragActive ? Style.active : ''}`} {...getRootProps()}>
        <input {...getInputProps()} />
        <div className={Style.DropZone_box_input}>
          <p>{title}</p>
          <div className={Style.DropZone_box_input_img}>
            <Image
              src={images.upload}
              alt="upload"
              width={100}
              height={100}
              objectFit="contain"
              className={Style.DropZone_box_input_img_img}
            />
          </div>
          <p>{heading}</p>
          <p>{subHeading}</p>
        </div>
      </div>

      {isLoading ? (
        <div className={Style.DropZone_box_aside_box_loading}>
          <p>Uploading file...</p>
        </div>
      ) : fileUrl && (
        <aside className={Style.DropZone_box_aside}>
          <div className={Style.DropZone_box_aside_box}>
            <div className={Style.DropZone_box_aside_box_wrapper}>
              {fileType === 'application/pdf' ? (
                <div className={Style.DropZone_box_aside_box_pdf}>
                  <div className={Style.pdf_icon} onClick={() => setShowPDFPreview(true)}>
                    <PDFIcon />
                    <p>Click to preview PDF</p>
                  </div>
                  {showPDFPreview && (
                    <PDFViewer 
                      pdfUrl={fileUrl} 
                      onClose={() => setShowPDFPreview(false)}
                    />
                  )}
                </div>
              ) : (
                <img src={fileUrl} alt="nft preview" width={200} height={200} />
              )}
              <div className={Style.file_type_indicator}>
                <span>{fileType === 'application/pdf' ? 'PDF Document' : 'Image'}</span>
              </div>
              {uploadedFileSize && (
                <div className={Style.file_size_indicator}>
                  <span>{uploadedFileSize}</span>
                </div>
              )}
            </div>

            <div className={Style.DropZone_box_aside_box_preview}>
              <div className={Style.DropZone_box_aside_box_preview_one}>
                <p>
                  <samp>NFT Name:</samp>
                  {name || ""}
                </p>
                <p>
                  <samp>Website:</samp>
                  {website || ""}
                </p>
              </div>

              <div className={Style.DropZone_box_aside_box_preview_two}>
                <p>
                  <span>Description</span>
                  {description || ""}
                </p>
              </div>

              <div className={Style.DropZone_box_aside_box_preview_three}>
                <p>
                  <span>Royalties</span>
                  {royalties || ""}
                </p>
                <p>
                  <span>FileSize</span>
                  {uploadedFileSize || ""}
                </p>
                <p>
                  <span>Properties</span>
                  {properties || ""}
                </p>
                <p>
                  <span>Category</span>
                  {category || ""}
                </p>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default DropZone;
