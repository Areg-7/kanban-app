// app/page.tsx

import Kanban from "@/components/Kanban";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <h1 className="mb-8 text-3xl font-bold text-center">Kanban Board</h1>
      <Kanban />
    </main>
  );
}
