const validateProject = (req, res, next) => {
  const { name, url_suffix } = req.body;
  
  // 验证项目名称
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }
  
  // 验证URL后缀
  if (!url_suffix) {
    return res.status(400).json({ error: 'URL suffix is required' });
  }
  
  // URL后缀必须以/开头
  if (!url_suffix.startsWith('/')) {
    return res.status(400).json({ error: 'URL suffix must start with /' });
  }
  
  // URL后缀格式验证
  const urlSuffixPattern = /^\/[a-zA-Z0-9_\-\/]*$/;
  if (!urlSuffixPattern.test(url_suffix)) {
    return res.status(400).json({ error: 'URL suffix contains invalid characters' });
  }
  
  next();
};

const validateMock = (req, res, next) => {
  const { path, method, response_body } = req.body;
  
  // 验证路径
  if (!path) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  // 路径必须以/开头
  if (!path.startsWith('/')) {
    return res.status(400).json({ error: 'Path must start with /' });
  }
  
  // 路径格式验证
  const pathPattern = /^\/[a-zA-Z0-9_\-\/]*$/;
  if (!pathPattern.test(path)) {
    return res.status(400).json({ error: 'Path contains invalid characters' });
  }
  
  // 验证请求方法
  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  if (!method || !validMethods.includes(method.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid HTTP method' });
  }
  
  // 验证响应体是否为有效的JSON
  if (!response_body) {
    return res.status(400).json({ error: 'Response body is required' });
  }
  
  // 如果响应体是字符串，尝试解析它
  if (typeof response_body === 'string') {
    try {
      JSON.parse(response_body);
    } catch (error) {
      return res.status(400).json({ error: 'Response body must be valid JSON' });
    }
  }
  
  next();
};

module.exports = {
  validateProject,
  validateMock
};
