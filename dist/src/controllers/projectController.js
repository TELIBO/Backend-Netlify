"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.createProject = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield prisma.project.findMany();
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving projects" });
    }
});
exports.getProjects = getProjects;
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, startDate, endDate } = req.body;
    try {
        const newProject = yield prisma.project.create({
            data: {
                name,
                description,
                startDate,
                endDate,
            },
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        res.status(500).json({ message: `Error creating project${error.message}` });
    }
});
exports.createProject = createProject;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        // First, delete related task assignments (if any)
        yield prisma.taskAssignment.deleteMany({
            where: {
                task: {
                    projectId: Number(projectId),
                },
            },
        });
        // Next, delete related attachments (if any)
        yield prisma.attachment.deleteMany({
            where: {
                task: {
                    projectId: Number(projectId),
                },
            },
        });
        // Next, delete related comments (if any)
        yield prisma.comment.deleteMany({
            where: {
                task: {
                    projectId: Number(projectId),
                },
            },
        });
        // Next, delete related tasks (if any)
        yield prisma.task.deleteMany({
            where: {
                projectId: Number(projectId),
            },
        });
        // Next, delete related project teams (if any)
        yield prisma.projectTeam.deleteMany({
            where: {
                projectId: Number(projectId),
            },
        });
        // Finally, delete the project itself
        const deletedProject = yield prisma.project.delete({
            where: {
                id: Number(projectId),
            },
        });
        res.json({ message: "Project deleted successfully", deletedProject });
    }
    catch (error) {
        res.status(500).json({ message: `Error deleting project: ${error.message}` });
    }
});
exports.deleteProject = deleteProject;
