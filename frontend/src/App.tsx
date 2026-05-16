import { useState } from "react";
import Header from "./components/Header";
import AllNotifications from "./pages/AllNotifications";
import PriorityNotifications from "./pages/PriorityNotifications";

type PageName = "all" | "priority";

function App() {
  const [currentPage, setCurrentPage] = useState<PageName>("all");

  return (
    <>
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      {currentPage === "all" ? <AllNotifications /> : <PriorityNotifications />}
    </>
  );
}

export default App;
