"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/types/canvas";
import { Trash2, FolderOpen, Save, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "save" | "load";
  currentProjectName: string;
  projects: Project[];
  onSave: (name: string) => void;
  onLoad: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onNew: () => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  mode,
  currentProjectName,
  projects,
  onSave,
  onLoad,
  onDelete,
  onNew,
}: ProjectDialogProps) {
  const [projectName, setProjectName] = useState(currentProjectName);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProjectName(currentProjectName);
      setSelectedProjectId(null);
    }
  }, [open, currentProjectName]);

  const handleSave = () => {
    if (projectName.trim()) {
      onSave(projectName.trim());
      onOpenChange(false);
    }
  };

  const handleLoad = () => {
    if (selectedProjectId) {
      onLoad(selectedProjectId);
      onOpenChange(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      onDelete(projectId);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    }
  };

  const handleNewProject = () => {
    onNew();
    onOpenChange(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "save" ? (
              <>
                <Save className="w-5 h-5" />
                Save Project
              </>
            ) : (
              <>
                <FolderOpen className="w-5 h-5" />
                Open Project
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {mode === "save" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!projectName.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-2 mb-4">
              <Button variant="outline" onClick={handleNewProject} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-md">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved projects yet</p>
                  <p className="text-sm mt-1">Create and save your first project!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-muted transition-colors",
                        selectedProjectId === project.id && "bg-primary/10"
                      )}
                      onClick={() => setSelectedProjectId(project.id)}
                      onDoubleClick={() => {
                        setSelectedProjectId(project.id);
                        onLoad(project.id);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{project.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.updatedAt)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {project.state.elements.length} element{project.state.elements.length !== 1 ? "s" : ""} • 
                            {" "}{project.state.canvasSettings.canvasSize.name}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(e, project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleLoad} disabled={!selectedProjectId}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
