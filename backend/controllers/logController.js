const logService = require('../services/logService');

exports.getLogs = async (req, res) => {
  try {
    const filters = {
      projectId: req.query.projectId,
      matched: req.query.matched !== undefined ? req.query.matched === 'true' : undefined
    };
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const paginatedLogs = await logService.getLogs(filters, page, limit);
    res.json(paginatedLogs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
};
