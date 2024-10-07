import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { t } from "../../../../../../constants/messages";
import { AliSuperDealsTitlePopover } from "../popover/title-popover";
import { TextLineThrough } from "./datatable-columns.style";

export const columns: GridColDef[] = [
  {
    field: "id",
    headerName: t("product"),
    width: 100,
    headerAlign: "left",
    align: "left",
    renderCell: (params: GridRenderCellParams) => <img src={params.row.imageUrl} alt="" width="100%" />
  },
  {
    field: "title",
    headerName: t("title"),
    align: "left",
    headerAlign: "left",
    flex: 4,
    cellClassName: "title-popover__cell",
    renderCell: (params: GridRenderCellParams) => (
      <AliSuperDealsTitlePopover
        title={params.value}
        imageUrl={params.row.imageUrl}
        productUrl={params.row.productUrl}
        dealImages={params.row.dealImagesType}
        shipping={params.row.shippingDetails}
      />
    )
  },
  {
    field: "finalPrice",
    headerName: t("price"),
    type: "number",
    width: 150,
    headerAlign: "left",
    align: "left",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Box>
        <span className="MuiDataGrid__final-price">
          {params.row.currency.split("US")?.[1]} {params.value}
        </span>
        <TextLineThrough sx={{ marginLeft: "4px" }}>({params.row.originPriceString})</TextLineThrough>
      </Box>
    )
  },
  {
    field: "discount",
    headerName: t("savings"),
    headerAlign: "left",
    align: "left",
    width: 100,
    type: "number",
    renderCell: (params: GridRenderCellParams) => (
      <Chip
        label={`${params.row.currency.split("US")?.[1]}${params.value}`}
        className="MuiDataGrid__chip MuiDataGrid__chip--green"
      />
    )
  },
  {
    field: "extraDiscount",
    headerName: t("extra"),
    headerAlign: "left",
    hideSortIcons: true,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    align: "left",
    width: 60,
    renderCell: (params: GridRenderCellParams) => (
      <Box>
        {params.row.dealImagesType.some((item) =>
          item.includes("S051e42ccb51347c58a6083a38aa7bcffP/190x64.png_.webp")
        ) ? (
          <CheckCircleIcon fontSize="small" sx={{ color: "#009966" }} />
        ) : (
          <HighlightOffIcon fontSize="small" sx={{ color: "#981B1B" }} />
        )}
      </Box>
    )
  },
  {
    field: "rating",
    headerName: t("rating"),
    headerAlign: "left",
    align: "left",
    type: "number",
    renderCell: (params: GridRenderCellParams) => (
      <Box component="div" className="MuiDataGrid__rating">
        <StarIcon sx={{ color: "#FFA41C" }} />
        <span className="MuiDataGrid__rating__score">{params.value}</span>/5
      </Box>
    )
  },
  {
    field: "productSoldAmount",
    headerName: t("sold"),
    headerAlign: "left",
    align: "left",
    width: 80,
    type: "number",
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Chip className="MuiDataGrid__chip MuiDataGrid__chip--grey" label={`${params.row.productSoldAmount}`} />
    )
  }
];
