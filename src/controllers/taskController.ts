import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.query;

    try {
        const tasks = await prisma.task.findMany({
            where: {
                projectId: Number(projectId),
            },
            include: {
                author: true,
                assignee: true,
                comments: true,
                attachments: true,
            },
        });

        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: `Error retrieving tasks: ${error.message}` });
    }
};
export const createTask = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      points,
      projectId,
      authorUserId,
      assignedUserId,
    } = req.body;
    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          status,
          priority,
          tags,
          startDate,
          dueDate,
          points,
          projectId,
          authorUserId,
          assignedUserId,
        },
      });
      res.status(201).json(newTask);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error creating a task: ${error.message}` });
    }
  };
  export const updateTaskStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
      const updatedTask = await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data: {
          status: status,
        },
      });
      res.json(updatedTask);
    } catch (error: any) {
      res.status(500).json({ message: `Error updating task: ${error.message}` });
    }
  };  
  export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
  
    try {
      // First, delete related task assignments
      await prisma.taskAssignment.deleteMany({
        where: {
          taskId: Number(taskId),
        },
      });
  
      // Next, delete related comments
      await prisma.comment.deleteMany({
        where: {
          taskId: Number(taskId),
        },
      });
  
      // Then, delete the task itself
      const deletedTask = await prisma.task.delete({
        where: {
          id: Number(taskId),
        },
      });
  
      res.json({ message: "Task deleted successfully", deletedTask });
    } catch (error: any) {
      res.status(500).json({ message: `Error deleting task: ${error.message}` });
    }
  };