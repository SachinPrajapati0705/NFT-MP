import React, { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsImages } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

//INTERNAL IMPORT
import Style from "./NFTCard.module.css";
import images from "../../img";
import PDFViewer from "../PDFViewer/PDFViewer";

const NFTCard = ({ NFTData }) => {
  // const CardArray = [
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  // ];

  const [like, setLike] = useState(true);
  const [selectedPDF, setSelectedPDF] = useState(null);

  const likeNft = () => {
    if (!like) {
      setLike(true);
    } else {
      setLike(false);
    }
  };

  const isPDF = (url) => {
    return url?.toLowerCase().includes('.pdf');
  };

  // console.log(NFTData);
  return (
    <div className={Style.NFTCard}>
      {NFTData && Array.isArray(NFTData) && NFTData.map((el, i) => (
        <div key={i + 1}>
          {isPDF(el.image) ? (
            <div 
              className={Style.NFTCard_box} 
              onClick={() => setSelectedPDF(el.image)}
            >
              <div className={Style.NFTCard_box_img}>
                <div className={Style.NFTCard_box_img_pdf}>
                  <FaFilePdf size={50} color="var(--icons-color)" />
                  <p>View PDF</p>
                </div>
              </div>

              <div className={Style.NFTCard_box_update}>
                <div className={Style.NFTCard_box_update_left}>
                  <div
                    className={Style.NFTCard_box_update_left_like}
                    onClick={(e) => {
                      e.stopPropagation();
                      likeNft();
                    }}
                  >
                    {like ? (
                      <AiOutlineHeart />
                    ) : (
                      <AiFillHeart
                        className={Style.NFTCard_box_update_left_like_icon}
                      />
                    )}
                    {""} 22
                  </div>
                </div>

                <div className={Style.NFTCard_box_update_right}>
                  <div className={Style.NFTCard_box_update_right_info}>
                    <small>Remaining time</small>
                    <p>3h : 15m : 20s</p>
                  </div>
                </div>
              </div>

              <div className={Style.NFTCard_box_update_details}>
                <div className={Style.NFTCard_box_update_details_price}>
                  <div className={Style.NFTCard_box_update_details_price_box}>
                    <h4>
                      {el.name} #{el.tokenId}
                    </h4>

                    <div
                      className={Style.NFTCard_box_update_details_price_box_box}
                    >
                      <div
                        className={Style.NFTCard_box_update_details_price_box_bid}
                      >
                        <small>Current Bid</small>
                        <p>{el.price}ETH</p>
                      </div>
                      <div
                        className={
                          Style.NFTCard_box_update_details_price_box_stock
                        }
                      >
                        <small>61 in stock</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={Style.NFTCard_box_update_details_category}>
                  <FaFilePdf />
                </div>
              </div>
            </div>
          ) : (
            <Link href={{ pathname: "/NFT-details", query: el }}>
              <div className={Style.NFTCard_box}>
                <div className={Style.NFTCard_box_img}>
                  <img
                    src={el.image}
                    alt="NFT images"
                    className={Style.NFTCard_box_img_img}
                  />
                </div>

                <div className={Style.NFTCard_box_update}>
                  <div className={Style.NFTCard_box_update_left}>
                    <div
                      className={Style.NFTCard_box_update_left_like}
                      onClick={() => likeNft()}
                    >
                      {like ? (
                        <AiOutlineHeart />
                      ) : (
                        <AiFillHeart
                          className={Style.NFTCard_box_update_left_like_icon}
                        />
                      )}
                      {""} 22
                    </div>
                  </div>

                  <div className={Style.NFTCard_box_update_right}>
                    <div className={Style.NFTCard_box_update_right_info}>
                      <small>Remaining time</small>
                      <p>3h : 15m : 20s</p>
                    </div>
                  </div>
                </div>

                <div className={Style.NFTCard_box_update_details}>
                  <div className={Style.NFTCard_box_update_details_price}>
                    <div className={Style.NFTCard_box_update_details_price_box}>
                      <h4>
                        {el.name} #{el.tokenId}
                      </h4>

                      <div
                        className={Style.NFTCard_box_update_details_price_box_box}
                      >
                        <div
                          className={Style.NFTCard_box_update_details_price_box_bid}
                        >
                          <small>Current Bid</small>
                          <p>{el.price}ETH</p>
                        </div>
                        <div
                          className={
                            Style.NFTCard_box_update_details_price_box_stock
                          }
                        >
                          <small>61 in stock</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={Style.NFTCard_box_update_details_category}>
                    <BsImages />
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      ))}

      {selectedPDF && (
        <PDFViewer 
          pdfUrl={selectedPDF} 
          onClose={() => setSelectedPDF(null)} 
        />
      )}
    </div>
  );
};

export default NFTCard;
