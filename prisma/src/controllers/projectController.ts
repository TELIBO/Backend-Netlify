import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const projects = await prisma.project.findMany();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving projects" });
    }
};
export const createProject = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name, description, startDate, endDate } = req.body;

    try {
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                startDate,
                endDate,
            },
        });

        res.status(201).json(newProject);
    } catch (error:any) {
        res.status(500).json({ message: `Error creating project${error.message}` });
    }
};
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;

    try {
        // First, delete related task assignments (if any)
        await prisma.taskAssignment.deleteMany({
            where: {
                task: {
                    projectId: Number(projectId),
                },
            },
        });

        // Next, delete related attachments (if any)
        await prisma.attachment.deleteMany({
            where: {
                task: {
                    projectId: Number(projectId),
                },
            },
        });

        // Next, delete related comments (if any)
        await prisma.comment.deleteMany({
            where: {
                task: {
                    projectId: Number(projectId),
                },
            },
        });

        // Next, delete related tasks (if any)
        await prisma.task.deleteMany({
            where: {
                projectId: Number(projectId),
            },
        });

        // Next, delete related project teams (if any)
        await prisma.projectTeam.deleteMany({
            where: {
                projectId: Number(projectId),
            },
        });

        // Finally, delete the project itself
        const deletedProject = await prisma.project.delete({
            where: {
                id: Number(projectId),
            },
        });

        res.json({ message: "Project deleted successfully", deletedProject });
    } catch (error: any) {
        res.status(500).json({ message: `Error deleting project: ${error.message}` });
    }
};