import { useEffect } from "react";
import { RefreshCw, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

// Redux
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchJobBidsAsync, selectJobBids } from "../../store/slices/bidSlice";

// UI
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface TransparentBidsListProps {
  requestId: number;
}

export const TransparentBidsList = ({ requestId }: TransparentBidsListProps) => {
  const dispatch = useAppDispatch();
  const bids = useAppSelector(selectJobBids);
  const { t } = useTranslation();

  const loadBids = () => {
    if (requestId) {
      dispatch(fetchJobBidsAsync(requestId));
    }
  };

  useEffect(() => {
    loadBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <Card className="mt-6 border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-border/60 bg-muted/20">
        <CardTitle className="text-base font-bold text-foreground">
          Recent Bids (Transparency View)
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadBids}
          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
          title="Refresh Bids"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-xs font-medium">Refresh</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Mechanic</TableHead>
              <TableHead>Price (€)</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids && bids.length > 0 ? (
              bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary bg-primary/5"
                    >
                      Mechanic #{bid.mechanicId}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                    €{bid.price}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {bid.durationDays > 0 ? `${bid.durationDays} Days ` : ""}
                    {bid.durationHours > 0 ? `${bid.durationHours} Hours` : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(bid.createdAt)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No bids placed yet. Be the first!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
