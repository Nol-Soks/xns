export default function Dashboard() {
  const handleHistoryButton = () => {};
  const handleOrderButton = () => {};
  const handlePriceButton = () => {};
  return (
    <div>
      <button onClick={handleOrderButton}>Orders</button>
      <button onClick={handleHistoryButton}>TradeHistory</button>
      <button onClick={handlePriceButton}>Prices</button>
    </div>
  );
}
