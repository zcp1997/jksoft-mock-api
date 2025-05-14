// This is an updated logController.js to fix the matched parameter issue

const logService = require("../services/logService");

exports.getLogs = async (req, res) => {
  try {
    const filters = {
      projectId: req.query.projectId,
      // Improved conversion of matched parameter from string to boolean
      matched: req.query.matched !== undefined 
        ? req.query.matched === "true" || req.query.matched === true
        : undefined,
      keyword: req.query.keyword,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    
    const paginatedLogs = await logService.getLogs(filters, page, limit);
    res.json(paginatedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: error.message });
  }
};