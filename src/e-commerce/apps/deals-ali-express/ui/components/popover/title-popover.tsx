import * as React from "react";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

interface TitlePopoverProps {
  title: string;
  imageUrl: string;
  productUrl: string;
  dealImages: string[];
  shipping: { freeShipping: string };
}

export const AliSuperDealsTitlePopover = ({
  title,
  imageUrl,
  productUrl,
  dealImages,
  shipping
}: TitlePopoverProps): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <div className="title-popover__content">
      <div className="title-popover__title">
        <a
          className="title-popover__link"
          href={productUrl}
          target="_blank"
          aria-owns={open ? "mouse-over-popover" : undefined}
          aria-haspopup="true"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          rel="noreferrer"
        >
          {title}
        </a>
      </div>
      <div className="title-popover__tags">
        {dealImages?.map((type: string) => <img key={type} src={type} alt="" width="auto" height={25} />)}
        <span className="title-popover__tags__delivery">{shipping?.freeShipping}</span>
      </div>

      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
          marginTop: "20px"
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        className="flex"
      >
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <Item>
              <img src={imageUrl} alt={title} width="auto" height={200} />
            </Item>
          </Grid>
          <Grid item xs={10}>
            <Typography sx={{ textAlign: "left", padding: "25px" }}>{title}</Typography>
          </Grid>
        </Grid>
      </Popover>
    </div>
  );
};
