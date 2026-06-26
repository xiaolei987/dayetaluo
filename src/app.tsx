import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import HomePage from "@/pages/HomePage/HomePage";
import DrawPage from "@/pages/DrawPage/DrawPage";
import ResultPage from "@/pages/ResultPage/ResultPage";
import CardLibraryPage from "@/pages/CardLibraryPage/CardLibraryPage";
import CardDetailPage from "@/pages/CardDetailPage/CardDetailPage";
import HistoryPage from "@/pages/HistoryPage/HistoryPage";
import HistoryDetailPage from "@/pages/HistoryDetailPage/HistoryDetailPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="draw/:spreadId" element={<DrawPage />} />
        <Route path="result/:readingId" element={<ResultPage />} />
        <Route path="library" element={<CardLibraryPage />} />
        <Route path="library/:cardId" element={<CardDetailPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:readingId" element={<HistoryDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
