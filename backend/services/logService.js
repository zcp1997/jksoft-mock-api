const supabase = require('../utils/supabaseClient');

class LogService {
  async createLog(logData) {
    const { data, error } = await supabase
      .from('logs')
      .insert([logData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async getLogs(filters = {}, page = 1, limit = 10) {
    // 首先获取总数
    const countQuery = supabase
      .from('logs')
      .select('*', { count: 'exact', head: true });
    
    // 应用过滤器到计数查询
    if (filters.projectId) {
      countQuery.eq('project_id', filters.projectId);
    }
    
    if (filters.matched !== undefined) {
      countQuery.eq('matched', filters.matched);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) throw countError;
    
    // 数据查询
    let dataQuery = supabase
      .from('logs')
      .select('*, projects(name), mocks(path, method)')
      .order('timestamp', { ascending: false });
    
    // 应用过滤器到数据查询
    if (filters.projectId) {
      dataQuery = dataQuery.eq('project_id', filters.projectId);
    }
    
    if (filters.matched !== undefined) {
      dataQuery = dataQuery.eq('matched', filters.matched);
    }
    
    // 分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    dataQuery = dataQuery.range(from, to);
    
    const { data, error } = await dataQuery;
    
    if (error) throw error;
    
    // 计算总页数
    const totalPages = Math.ceil(count / limit);
    
    // 返回标准的分页结构
    return {
      items: data,
      page,
      limit,
      totalPages,
      total: count
    };
  }
}

module.exports = new LogService();
