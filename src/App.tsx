import { AppLayout } from "./app/layout/app-layout";
import { AppRouter } from "./app/routes/app-router";

export default function App() {
  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  );
}
