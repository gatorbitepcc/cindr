// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FindGroups from "./pages/FindGroups";
import CreateGroup from "./pages/CreateGroup";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import FindMatches from "./pages/FindMatches";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/find-groups" element={<FindGroups />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/settings" element={<Settings />} /> {/* ✅ new */}
          <Route path="/messages" element={<Messages />} />
          <Route path="/find-matches" element={<FindMatches />} />
          {/* keep this last */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* toast systems */}
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

