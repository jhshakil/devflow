"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Project, Task } from "@/lib/types";

interface TaskBoardProps {
  project: Project;
  initialTasks: Task[];
}

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "bg-slate-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500" },
  { id: "PAUSED", title: "Paused", color: "bg-amber-500" },
  { id: "WAITING", title: "Waiting", color: "bg-orange-500" },
  { id: "IN_REVIEW", title: "In Review", color: "bg-purple-500" },
  { id: "DONE", title: "Done", color: "bg-green-500" },
];

export default function TaskBoard({ project, initialTasks }: TaskBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Optimistic update
    const updatedTasks = Array.from(tasks);
    const taskIndex = updatedTasks.findIndex((t) => t.id === draggableId);
    const [movedTask] = updatedTasks.splice(taskIndex, 1);
    movedTask.status = destination.droppableId as Task["status"];
    updatedTasks.splice(destination.index, 0, movedTask);

    setTasks(updatedTasks);

    // Persist to DB
    try {
      await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destination.droppableId }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update task status", err);
      // Revert if failed
      setTasks(initialTasks);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start min-w-max">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="w-80 flex flex-col h-full rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 p-4 border border-slate-200/50 dark:border-slate-800/50"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${column.color}`}></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {column.title}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                  {tasks.filter((t) => t.status === column.id).length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 overflow-y-auto space-y-4 min-h-[150px] transition-colors rounded-xl px-1 ${
                    snapshot.isDraggingOver
                      ? "bg-slate-200/30 dark:bg-slate-800/30"
                      : ""
                  }`}
                >
                  {tasks
                    .filter((task) => task.status === column.id)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "transition-transform",
                              snapshot.isDragging
                                ? "z-50 scale-105 rotate-1"
                                : "",
                            )}
                          >
                            <TaskCard task={task} projectId={project.id} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
