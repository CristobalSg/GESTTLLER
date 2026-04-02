import { AppLayout } from "./app/layout/app-layout";
import { ProtectedRoute } from "./app/routes/protected-route";
import { AppRouter } from "./app/routes/app-router";

export default function App() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </ProtectedRoute>
  );
}
