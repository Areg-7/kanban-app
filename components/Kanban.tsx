"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

type CardType = {
  id: string;
  title: string;
  column: string;
};

type ColumnType = {
  id: string;
  title: string;
};

const columns: ColumnType[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const initialCards: CardType[] = [
  { id: "1", title: "Task One", column: "todo" },
  { id: "2", title: "Task Two", column: "todo" },
  { id: "3", title: "Task Three", column: "inprogress" },
];

export default function Kanban() {
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [draggingCard, setDraggingCard] = useState<CardType | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    card: CardType
  ) => {
    setDraggingCard(card);
    e.dataTransfer.setData("cardId", card.id);
    e.dataTransfer.setData("fromColumn", card.column);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, column: targetColumn } : card
      )
    );
    setDraggingCard(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
      {columns.map((column) => (
        <div
          key={column.id}
          onDrop={(e) => handleDrop(e, column.id)}
          onDragOver={handleDragOver}
          className="flex flex-col rounded-lg border border-neutral-700 bg-neutral-900 p-4"
        >
          <h2 className="mb-4 text-xl font-semibold text-neutral-100">
            {column.title}
          </h2>
          <div className="flex flex-col gap-3">
            {cards
              .filter((card) => card.column === column.id)
              .map(({ id, title, column }) => (
                <motion.div
                  key={id}
                  layoutId={id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, { title, id, column })
                  }
                  className={twMerge(
                    "cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing",
                    draggingCard?.id === id && "opacity-50"
                  )}
                >
                  <p className="text-sm text-neutral-100">{title}</p>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
