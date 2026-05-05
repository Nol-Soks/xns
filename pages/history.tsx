import axios from "axios";
import { useSession } from "next-auth/react";
import Error from "next/error";
import { useEffect, useState } from "react";

type TradeHistory = {
  id: number;
  // userId: number;
  // orderId: number,
  symbol: string;
  type: string;
  status: string;
  price: number;
  quantity: number;
};

export default function History() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await axios.get("/api/history");
        setHistory(res.data.data || []);
      } catch (err: any) {
        setError(err.message || "failed to fetch");
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") {
      fetchHistory();
    }
  }, [status]);

  if (status === "loading") {
    return <p>Checking authentication . . . </p>;
  }

  if (status === "unauthenticated") {
    return <p>Unauthorized user :) </p>;
  }

  return (
    <div>
      <h1>Trade History</h1>
      {loading && <p>Loading history . . . </p>}
      {error && <p>Erro while fetching . . .</p>}
      <body>
        {history.length > 0 ? (
          history.map((trade) => (
            <tr key={trade.id}>
              <td>{trade.symbol}</td>
              <td>{trade.type}</td>
              <td>{trade.quantity}</td>
              <td>{trade.price}</td>
              <td>{trade.status}</td>
            </tr>
          ))
        ) : (
          <td>
            <tr>No Trades Found</tr>
          </td>
        )}
      </body>
    </div>
  );
}
