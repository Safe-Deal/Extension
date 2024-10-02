import { DataGrid, GridRowsProp, GridSortModel } from "@mui/x-data-grid"
import * as React from "react"
import { useEffect, useState } from "react"
import { ISuperDealProduct } from "../../../common/interfaces"
import { columns } from "./datatable-columns"

interface SuperDealsDataTableProps {
  deals: ISuperDealProduct[];
  loading: boolean;
}

export default function SuperDealsDataTable({ deals, loading = false }: SuperDealsDataTableProps) {
	const [rows, setRows] = useState<GridRowsProp>(deals)
	const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "discountPercent", sort: "desc" }])

	useEffect(() => {
		setRows(deals)
	}, [deals])

	const handleRowClick = (params) => {
		const { productUrl } = params.row
		if (productUrl) {
			window.open(productUrl, "_blank")
		}
	}

	return (
		<DataGrid
			rows={rows}
			onRowClick={handleRowClick}
			columns={columns}
			loading={loading}
			hideFooterPagination
			disableColumnMenu
			hideFooterSelectedRowCount
			rowHeight={110}
			initialState={{
				pagination: {
					paginationModel: { pageSize: 100, page: 0 }
				}
			}}
			sortModel={sortModel}
			onSortModelChange={(model) => setSortModel(model)}
		/>
	)
}
