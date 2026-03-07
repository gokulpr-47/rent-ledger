"use client";

import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { CheckCircle, Pencil } from "lucide-react";
import { RentalItem } from "@/lib/types";
import ReturnItemModal from "./ReturnItemModal";
import EditPriceModal from "./EditPriceModal";
import { format } from "date-fns";

interface RentalItemsTableProps {
  items: RentalItem[];
  readOnly?: boolean;
  onReturn?: (itemId: string, returnedTime: string) => Promise<void>;
  onEditPrice?: (itemId: string, price: number) => Promise<void>;
}

const formatDate = (d: string) => {
  try {
    return format(new Date(d), "dd MMM yyyy HH:mm");
  } catch {
    return d;
  }
};

const calcDays = (taken: string, returned?: string | null): number => {
  if (!returned) return 0;
  const diff = new Date(returned).getTime() - new Date(taken).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
};

export default function RentalItemsTable({
  items,
  readOnly = false,
  onReturn,
  onEditPrice,
}: RentalItemsTableProps) {
  const [returnItem, setReturnItem] = useState<RentalItem | null>(null);
  const [editPriceItem, setEditPriceItem] = useState<RentalItem | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  const handleReturn = async (itemId: string, returnedTime: string) => {
    if (!onReturn) return;
    setReturnLoading(true);
    await onReturn(itemId, returnedTime);
    setReturnLoading(false);
    setReturnItem(null);
  };

  const handleEditPrice = async (itemId: string, price: number) => {
    if (!onEditPrice) return;
    setPriceLoading(true);
    await onEditPrice(itemId, price);
    setPriceLoading(false);
    setEditPriceItem(null);
  };

  if (items.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ py: 2, textAlign: "center" }}
      >
        No items in this rental
      </Typography>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                Item
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                Notes
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                Taken
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                Returned
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                Qty
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                ₹/Day
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                Days
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                Total
              </TableCell>
              {!readOnly && (
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const isReturned = !!item.returnedTime;
              const days = calcDays(item.takenTime, item.returnedTime);
              return (
                <TableRow
                  key={item._id}
                  hover
                  sx={{ opacity: isReturned ? 0.85 : 1 }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {item.productName}
                      </Typography>
                      {isReturned && (
                        <Chip
                          label="Returned"
                          size="small"
                          sx={{
                            fontSize: "0.65rem",
                            height: 18,
                            backgroundColor: "#DCFCE7",
                            color: "#166534",
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.notes || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {formatDate(item.takenTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      noWrap
                      color={isReturned ? "text.primary" : "text.secondary"}
                    >
                      {item.returnedTime ? formatDate(item.returnedTime) : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.quantity}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {isReturned ? days : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      ₹{item.pricePerDay}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={isReturned ? "text.primary" : "text.secondary"}
                    >
                      {isReturned
                        ? `₹${item.total.toLocaleString("en-IN")}`
                        : "—"}
                    </Typography>
                  </TableCell>
                  {!readOnly && (
                    <TableCell align="right">
                      {!isReturned && onReturn && (
                        <Tooltip title="Mark Returned">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => setReturnItem(item)}
                          >
                            <CheckCircle size={15} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onEditPrice && (
                        <Tooltip title="Edit Price">
                          <IconButton
                            size="small"
                            onClick={() => setEditPriceItem(item)}
                          >
                            <Pencil size={14} color="#64748B" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ReturnItemModal
        open={!!returnItem}
        item={returnItem}
        onClose={() => setReturnItem(null)}
        onSubmit={handleReturn}
        loading={returnLoading}
      />
      <EditPriceModal
        open={!!editPriceItem}
        item={editPriceItem}
        onClose={() => setEditPriceItem(null)}
        onSubmit={handleEditPrice}
        loading={priceLoading}
      />
    </>
  );
}
