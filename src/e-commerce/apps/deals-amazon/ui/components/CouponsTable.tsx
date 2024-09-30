import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SellIcon from "@mui/icons-material/Sell";
import SearchIcon from "@mui/icons-material/Search";
import Badge from "@mui/material/Badge";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/system/Box";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useCallback, useState } from "react";
import { t } from "../../../../../constants/messages";

import { SocialShare } from "../../../../components/SocialShare";
import "./CouponsTable.scss";

const ROWS_PER_PAGE = 10;

const CouponsTable = ({ coupons }) => {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState("discountPercent");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSearch = (e) => setSearchText(e.target.value);
  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1);
  };

  const toggleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  const sortedData = coupons.sort((a, b) => {
    if (!sortField) return 0;
    if (sortDirection === "asc") return a[sortField] < b[sortField] ? -1 : 1;
    return a[sortField] > b[sortField] ? -1 : 1;
  });

  const filteredDataSource = sortedData.filter((item) =>
    item?.title?.toLowerCase().includes(searchText?.toLowerCase())
  );

  const SortIndicator = useCallback(
    ({ field, children }) => (
      <div style={{ display: "inline-flex", position: "relative", alignItems: "center" }}>
        {children}
        <span style={{ position: "absolute", right: "-18px", top: "1px" }}>
          {field === sortField &&
            (sortDirection === "asc" ? (
              <ArrowUpwardIcon style={{ fontSize: "small" }} />
            ) : (
              <ArrowDownwardIcon style={{ fontSize: "small" }} />
            ))}
        </span>
      </div>
    ),
    [sortField, sortDirection]
  );

  return (
    <div className="deals-table">
      <div className="deals-table__header">
        <Typography variant="h6" className="deals-table__title">
          {filteredDataSource.length} {t("discounts_found")}
        </Typography>
        <TextField
          variant="outlined"
          placeholder={t("search_product")}
          onChange={handleSearch}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </div>
      <TableContainer
        component={Box}
        sx={{ maxHeight: "calc(100vh - 200px)", maxWidth: "100%" }}
        className="deals-table__container"
      >
        <Table sx={{ minWidth: 650 }} stickyHeader size="small" aria-label="coupons table">
          <TableHead className="deals-table__head">
            <TableRow className="deals-table__row">
              <TableCell align="center" className="deals-table__cell--image">
                {t("image")}
              </TableCell>
              <TableCell
                align="left"
                width="40%"
                className="deals-table__cell--product deals-table__cell--clickable"
                onClick={() => toggleSort("title")}
              >
                <SortIndicator field="title">{t("product_name")}</SortIndicator>
              </TableCell>
              <TableCell
                align="center"
                className="deals-table__cell--price deals-table__cell--clickable"
                onClick={() => toggleSort("finalPrice")}
              >
                <SortIndicator field="finalPrice">{t("final_price")}</SortIndicator>
              </TableCell>
              <TableCell
                align="center"
                className="deals-table__cell--coupon deals-table__cell--clickable"
                onClick={() => toggleSort("discountPercent")}
              >
                <SortIndicator field="discountPercent"> {t("coupon")}</SortIndicator>
              </TableCell>
              <TableCell
                align="center"
                className="deals-table__cell--saved deals-table__cell--clickable"
                onClick={() => toggleSort("discountPrice")}
              >
                <SortIndicator field="discountPrice"> {t("you_saved")}</SortIndicator>
              </TableCell>
              <TableCell align="center" className="deals-table__cell--share">
                {t("share")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="deals-table__body">
            {filteredDataSource.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE).map((row, index) => (
              <TableRow key={index} className="deals-table__row">
                <TableCell
                  align="center"
                  className="deals-table__cell--image"
                  onClick={() => window.open(row.productUrl, "_blank")}
                >
                  <Tooltip title={<img src={row.imageUrl} alt="product" style={{ width: "450px" }} />}>
                    <img src={row.imageUrl} alt="product" className="deals-table__image" />
                  </Tooltip>
                </TableCell>
                <TableCell
                  align="left"
                  className="deals-table__cell--product"
                  onClick={() => window.open(row.productUrl, "_blank")}
                >
                  {row.title}
                </TableCell>
                <TableCell
                  align="center"
                  className="deals-table__cell--price"
                  onClick={() => window.open(row.productUrl, "_blank")}
                >
                  <Badge
                    badgeContent={`${row.currency}${row.finalPrice}`}
                    className="deals-table__cell--price__badge"
                  />
                </TableCell>
                <TableCell
                  align="center"
                  className="deals-table__cell--coupon"
                  onClick={() => window.open(row.productUrl, "_blank")}
                >
                  <Badge
                    badgeContent={
                      <>
                        <SellIcon />
                        {`${row.discountPercent}%`}
                      </>
                    }
                    className="deals-table__cell--coupon__badge"
                  />
                </TableCell>
                <TableCell
                  align="center"
                  className="deals-table__cell--saved"
                  onClick={() => window.open(row.productUrl, "_blank")}
                >
                  <Badge
                    badgeContent={`${row.currency}${row.discountPrice}`}
                    className="deals-table__cell--saved__badge"
                  />
                </TableCell>
                <TableCell align="center" className="deals-table__cell--share">
                  <SocialShare shareLink={row.productUrl} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box className="deals-table__navigation">
          <IconButton
            className="deals-table__navigation__button deals-table__navigation__button--prev"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            <ArrowBackIcon /> Previous
          </IconButton>
          <Pagination
            count={Math.ceil(filteredDataSource.length / ROWS_PER_PAGE)}
            page={page + 1}
            onChange={handleChangePage}
            siblingCount={0}
            boundaryCount={1}
            hideNextButton
            hidePrevButton
          />
          <IconButton
            className="deals-table__navigation__button deals-table__navigation__button--next"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, Math.ceil(filteredDataSource.length / ROWS_PER_PAGE) - 1))
            }
          >
            Next <ArrowForwardIcon />
          </IconButton>
        </Box>
      </TableContainer>
    </div>
  );
};

export { CouponsTable };
