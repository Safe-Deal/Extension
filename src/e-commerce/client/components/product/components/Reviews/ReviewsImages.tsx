import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowBack from "@mui/icons-material/ArrowBack";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLazyLoad } from "../../../../hooks/useLazyLoad";
import { Z_INDEX_MAX } from "../../../constants";
import { ImageMagnifier } from "../Images/Magnifier";

export function ReviewsImages({ gallery }: { gallery: string[] }) {
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const [firstSlide, setFirstSlide] = useState(true);
  const [lastSlide, setLastSlide] = useState(false);
  const fullScreen = window.innerWidth < 600;
  useLazyLoad();

  const handleOpen = (index) => {
    setCurrentImage(index);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handlePrev = () => setCurrentImage((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  const handleNext = () => setCurrentImage((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));

  if (gallery?.length === 0) {
    return <div className="sd-review-summary__gallery sd-review-summary__gallery--no-images" />;
  }

  const showArrows = gallery.length > 4;

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      handleNext();
    } else if (event.key === "ArrowLeft") {
      handlePrev();
    } else if (event.key === "Escape") {
      handleClose();
    }
  };

  return (
    <div className="sd-review-summary__gallery">
      <div className="sd-review-summary__gallery__slider">
        {showArrows && (
          <button
            aria-label="Prev"
            className="sd-review-summary__gallery__slider__nav sd-review-summary__gallery__slider__nav--prev"
            type="button"
            onClick={() => swiper.slidePrev()}
            disabled={firstSlide}
          >
            <ArrowBack />
          </button>
        )}
        <div className="sd-review-summary__gallery__slider__swiper">
          <Swiper
            onSwiper={setSwiper}
            onSlideChange={(swiper) => {
              setFirstSlide(swiper.isBeginning);
              setLastSlide(swiper.isEnd);
            }}
            spaceBetween={8}
            slidesPerView={4}
          >
            {gallery.map((url, index) => (
              <SwiperSlide className="sd-review-summary__gallery__slider__swiper__slide" key={`${url}-${index}`}>
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className="sd-review-summary__gallery__slider__swiper__slide__img"
                  onClick={() => handleOpen(index)}
                  data-testid={`image-${index}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {showArrows && (
          <button
            aria-label="Next"
            className="sd-review-summary__gallery__slider__nav sd-review-summary__gallery__slider__nav--next"
            type="button"
            onClick={() => swiper.slideNext()}
            disabled={lastSlide}
          >
            <ArrowForward />
          </button>
        )}
      </div>

      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        aria-labelledby="gallery-dialog"
        PaperProps={{
          sx: {
            height: "100vh",
            m: 8,
            maxWidth: "100%",
            maxHeight: "100vh"
          }
        }}
        sx={{
          zIndex: Z_INDEX_MAX
        }}
        data-testid="image-dialog"
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "fixed",
            top: "5%",
            right: "5%",
            zIndex: 2,
            color: "#333333",
            backgroundColor: "#f8f8f8",
            "&:hover": {
              backgroundColor: "#e0e0e0"
            }
          }}
          data-testid="close-dialog-btn"
        >
          <CloseIcon />
        </IconButton>
        <IconButton
          onClick={handlePrev}
          sx={{
            position: "fixed",
            left: "5%",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            color: "#333333",
            backgroundColor: "#f8f8f8",
            "&:hover": {
              backgroundColor: "#e0e0e0"
            }
          }}
          data-testid="prev-img-btn"
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        <IconButton
          onClick={handleNext}
          sx={{
            position: "fixed",
            right: "5%",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            color: "#333333",
            backgroundColor: "#f8f8f8",
            "&:hover": {
              backgroundColor: "#e0e0e0"
            }
          }}
          data-testid="next-img-btn"
        >
          <ArrowForwardIosIcon />
        </IconButton>

        <Box
          component="div"
          sx={{
            height: "99.5vh",
            width: "auto",
            maxHeight: "100vh",
            margin: "1px",
            display: "flex",
            flex: "1",
            backgroundColor: "#333",
            justifyContent: "center",
            alignItems: "center",
            objectFit: "contain",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.25)",
            border: "1px solid #333",
            borderRadius: "6px",
            cursor: "pointer"
          }}
          onClick={handleNext}
          onKeyDown={handleKeyDown}
          data-testid="current-image"
        >
          <ImageMagnifier src={gallery[currentImage]} />
        </Box>
      </Dialog>
    </div>
  );
}
