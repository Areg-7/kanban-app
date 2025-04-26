// app/page.tsx

import { CustomKanban } from "@/components/Kanban"; // ⬅ no {}

export default function Home() {
  return (
    <div>
      <CustomKanban />
    </div>
  );
}
