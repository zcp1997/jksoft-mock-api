const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const mockController = require('../controllers/mockController');
const logController = require('../controllers/logController');
const { validateProject, validateMock } = require('../middleware/validator');

// 项目路由
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', validateProject, projectController.createProject);
router.put('/projects/:id', validateProject, projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Mock接口路由
router.get('/projects/:projectId/mocks', mockController.getAllMocksByProject);
router.get('/mocks/:mockId', mockController.getMockById);
router.post('/projects/:projectId/mocks', validateMock, mockController.createMock);
router.put('/mocks/:mockId', validateMock, mockController.updateMock);
router.delete('/mocks/:mockId', mockController.deleteMock);

// 日志路由
router.get('/logs', logController.getLogs);

module.exports = router;
