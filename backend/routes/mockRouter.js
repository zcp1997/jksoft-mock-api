const express = require('express');
const router = express.Router();
const mockService = require('../services/mockService');
const logService = require('../services/logService');
const projectService = require('../services/projectService');

// 这个路由处理所有发送到mock接口的请求
router.all('*', async (req, res) => {
  try {
    // 解析URL路径，提取项目后缀和API路径
    const fullPath = req.path;
    const segments = fullPath.split('/');
    
    // 至少需要两段：/项目后缀/api路径
    if (segments.length < 2) {
      const logData = {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        method: req.method,
        path: fullPath,
        matched: false,
        status_code: 404,
        response_summary: { error: 'Invalid mock URL format' }
      };
      
      await logService.createLog(logData);
      return res.status(404).json({ error: 'Invalid mock URL format' });
    }
    
    // 根据正确格式提取项目后缀和API路径
    // 例如：/myproject/api/users => 项目后缀=/myproject, API路径=/api/users
    const projectUrlSuffix = '/' + segments[1];
    const apiPath = '/' + segments.slice(2).join('/');

    console.log('projectUrlSuffix', projectUrlSuffix);
    console.log('apiPath', apiPath);
    
    // 查找匹配的项目
    const project = await projectService.getProjectByUrlSuffix(projectUrlSuffix);
    
    // 查找匹配的mock
    const mock = project ? await mockService.findMatchingMockWithProject(project.id, apiPath, req.method) : null;
    
    // 记录日志
    const logData = {
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      method: req.method,
      path: fullPath,
      matched: !!mock,
      status_code: mock ? 200 : 404,
      response_summary: mock ? { success: true } : { error: 'Mock not found' },
      project_id: project?.id,
      mock_id: mock?.id
    };
    
    await logService.createLog(logData);
    
    // 返回响应
    if (mock) {
      return res.status(200).json(mock.response_body);
    } else {
      return res.status(404).json({ error: 'Mock not found' });
    }
  } catch (error) {
    console.error('Error handling mock request:', error);
    
    // 记录错误日志
    try {
      const logData = {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        matched: false,
        status_code: 500,
        response_summary: { error: 'Internal server error' }
      };
      
      await logService.createLog(logData);
    } catch (logError) {
      console.error('Error logging request:', logError);
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
