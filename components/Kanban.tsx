"use client";

import React, { useState, DragEvent, FormEvent, Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTrash } from "react-icons/fi";
import { FaFire } from "react-icons/fa";

// Types
type ColumnType = "backlog" | "todo" | "doing" | "done";

type CardType = {
  title: string;
  id: string;
  column: ColumnType;
};

// Default Cards
const DEFAULT_CARDS: CardType[] = [
  { title: "Research OAuth vs JWT for user auth", id: "1", column: "backlog" },
  { title: "Decide on mobile-first or desktop-first layout", id: "2", column: "backlog" },
  { title: "Plan component folder structure", id: "3", column: "backlog" },
  { title: "Choose between Zustand and Redux Toolkit", id: "4", column: "backlog" },
  { title: "Set up CI/CD with GitHub Actions", id: "5", column: "todo" },
  { title: "Build reusable Modal component", id: "6", column: "todo" },
  { title: "Implement user login API", id: "7", column: "todo" },
  { title: "Develop responsive Navbar with dropdowns", id: "8", column: "doing" },
  { title: "Add logging to daily CRON", id: "9", column: "doing" },
  { title: "Set up Tailwind CSS and ESLint", id: "10", column: "done" },
];

// Main Kanban Component
export const CustomKanban = () => {
  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board />
    </div>
  );
};

// Board
const Board = () => {
  const [cards, setCards] = useState<CardType[]>(DEFAULT_CARDS);

  return (
    <div className="flex h-full w-full gap-3 overflow-x-auto p-12">
      {["backlog", "todo", "doing", "done"].map((col) => (
        <Column
          key={col}
          title={titles[col as ColumnType]}
          headingColor={headingColors[col as ColumnType]}
          column={col as ColumnType}
          cards={cards}
          setCards={setCards}
        />
      ))}
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

const titles: Record<ColumnType, string> = {
  backlog: "Backlog",
  todo: "TODO",
  doing: "In Progress",
  done: "Complete",
};

const headingColors: Record<ColumnType, string> = {
  backlog: "text-neutral-500",
  todo: "text-yellow-200",
  doing: "text-blue-200",
  done: "text-emerald-200",
};

// Column
type ColumnProps = {
  title: string;
  headingColor: string;
  column: ColumnType;
  cards: CardType[];
  setCards: Dispatch<SetStateAction<CardType[]>>;
};

const Column = ({ title, headingColor, column, cards, setCards }: ColumnProps) => {
  const [active, setActive] = useState(false);

  const filteredCards = cards.filter((c) => c.column === column);

  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDrop = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const beforeId = element.dataset.before || "-1";

    if (beforeId !== cardId) {
      let updated = [...cards];
      const movingCard = updated.find((c) => c.id === cardId);
      if (!movingCard) return;

      const updatedCard = { ...movingCard, column };
      updated = updated.filter((c) => c.id !== cardId);

      const insertIndex = updated.findIndex((c) => c.id === beforeId);
      if (insertIndex >= 0) {
        updated.splice(insertIndex, 0, updatedCard);
      } else {
        updated.push(updatedCard);
      }

      setCards(updated);
    }

    setActive(false);
    clearHighlights();
  };

  const handleDragLeave = () => {
    setActive(false);
    clearHighlights();
  };

  const getIndicators = () =>
    Array.from(document.querySelectorAll(`[data-column="${column}"]`) as unknown as HTMLElement[]);

  const clearHighlights = (els?: HTMLElement[]) => {
    (els || getIndicators()).forEach((el) => (el.style.opacity = "0"));
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();
    clearHighlights(indicators);

    const { element } = getNearestIndicator(e, indicators);
    element.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;
    return indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        return offset < 0 && offset > closest.offset
          ? { offset, element: child }
          : closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    );
  };

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="text-sm text-neutral-400">{filteredCards.length}</span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${active ? "bg-neutral-800/50" : ""}`}
      >
        {filteredCards.map((card) => (
          <Card key={card.id} {...card} handleDragStart={handleDragStart} />
        ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

// Card
type CardProps = CardType & {
  handleDragStart: (e: DragEvent, card: CardType) => void;
};

const Card = ({ title, id, column, handleDragStart }: CardProps) => {
  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
      >
        <p className="text-sm text-neutral-100">{title}</p>
      </motion.div>
    </>
  );
};

// DropIndicator
type DropIndicatorProps = {
  beforeId: string | null;
  column: ColumnType;
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => (
  <div
    data-before={beforeId || "-1"}
    data-column={column}
    className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
  />
);

// AddCard
type AddCardProps = {
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
};

const AddCard = ({ column, setCards }: AddCardProps) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newCard: CardType = {
      title: text.trim(),
      id: Math.random().toString(),
      column,
    };

    setCards((prev) => [...prev, newCard]);
    setText("");
    setAdding(false);
  };

  return adding ? (
    <motion.form layout onSubmit={handleSubmit}>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add new task..."
        className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-none"
      />
      <div className="mt-1.5 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-50"
        >
          Close
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 hover:bg-neutral-300"
        >
          Add
          <FiPlus />
        </button>
      </div>
    </motion.form>
  ) : (
    <motion.button
      layout
      onClick={() => setAdding(true)}
      className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-50"
    >
      Add card
      <FiPlus />
    </motion.button>
  );
};

// BurnBarrel
const BurnBarrel = ({ setCards }: { setCards: Dispatch<SetStateAction<CardType[]>> }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => setActive(false);

  const handleDrop = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setActive(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};
