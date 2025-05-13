const mockService = require('../services/mockService');

exports.getAllMocksByProject = async (req, res) => {
  try {
    const mocks = await mockService.getAllMocksByProject(req.params.projectId);
    res.json(mocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMockById = async (req, res) => {
  try {
    const mock = await mockService.getMockById(req.params.mockId);
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found' });
    }
    res.json(mock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMock = async (req, res) => {
  try {
    const mockData = {
      ...req.body,
      project_id: req.params.projectId
    };
    const mock = await mockService.createMock(mockData);
    res.status(201).json(mock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMock = async (req, res) => {
  try {
    const mock = await mockService.updateMock(req.params.mockId, req.body);
    if (!mock) {
      return res.status(404).json({ error: 'Mock not found' });
    }
    res.json(mock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMock = async (req, res) => {
  try {
    await mockService.deleteMock(req.params.mockId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
