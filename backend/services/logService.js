// This is an updated logService.js to fix the matched parameter issue

const supabase = require("../utils/supabaseClient");

class LogService {
  async createLog(logData) {
    const { data, error } = await supabase.from("logs").insert([logData]).select();
    if (error) throw error;
    return data[0];
  }

  async getLogs(filters = {}, page = 1, limit = 10) {
    // First get the count
    let countQuery = supabase.from("logs").select("*", { count: "exact", head: true });
    
    // 根据matched状态智能应用projectId过滤
    if (filters.projectId && filters.projectId !== "all") {
      // 如果matched为false或未定义，则不应该基于projectId过滤，因为unmatched日志可能没有projectId
      if (filters.matched === true) {
        countQuery = countQuery.eq("project_id", filters.projectId);
      } else {
        // 对于matched=false或未指定时，使用or查询：projectId匹配或无projectId
        countQuery = countQuery.or(`project_id.eq.${filters.projectId},project_id.is.null`);
      }
    }
    
    // Fix for the matched parameter
    if (filters.matched !== undefined && filters.matched !== null) {
      // Explicitly convert to boolean
      countQuery = countQuery.eq("matched", Boolean(filters.matched));
    }
    
    // Add date range filtering
    if (filters.startDate) {
      countQuery = countQuery.gte("timestamp", filters.startDate);
    }
    
    if (filters.endDate) {
      countQuery = countQuery.lte("timestamp", filters.endDate);
    }
    
    // Add keyword search
    if (filters.keyword) {
      countQuery = countQuery.or(`path.ilike.%${filters.keyword}%,method.ilike.%${filters.keyword}%`);
    }
    
    const { count, error: countError } = await countQuery;
    if (countError) throw countError;
    
    // Data query
    let dataQuery = supabase
      .from("logs")
      .select("*, projects(name), mocks(path, method)")
      .order("timestamp", { ascending: false });
    
    // 根据matched状态智能应用projectId过滤
    if (filters.projectId && filters.projectId !== "all") {
      // 如果matched为false或未定义，则不应该基于projectId过滤，因为unmatched日志可能没有projectId
      if (filters.matched === true) {
        dataQuery = dataQuery.eq("project_id", filters.projectId);
      } else {
        // 对于matched=false或未指定时，使用or查询：projectId匹配或无projectId
        dataQuery = dataQuery.or(`project_id.eq.${filters.projectId},project_id.is.null`);
      }
    }
    
    // Fix for the matched parameter
    if (filters.matched !== undefined && filters.matched !== null) {
      // Explicitly convert to boolean
      dataQuery = dataQuery.eq("matched", Boolean(filters.matched));
    }
    
    // Add date range filtering
    if (filters.startDate) {
      dataQuery = dataQuery.gte("timestamp", filters.startDate);
    }
    
    if (filters.endDate) {
      dataQuery = dataQuery.lte("timestamp", filters.endDate);
    }
    
    // Add keyword search
    if (filters.keyword) {
      dataQuery = dataQuery.or(`path.ilike.%${filters.keyword}%,method.ilike.%${filters.keyword}%`);
    }
    
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    dataQuery = dataQuery.range(from, to);
    
    // 添加调试日志
    console.log("SQL Query:", dataQuery.toSQL ? dataQuery.toSQL() : "SQL unavailable");
    
    const { data, error } = await dataQuery;
    if (error) throw error;
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    // Return standard pagination structure
    return {
      items: data,
      page,
      limit,
      totalPages,
      total: count,
    };
  }
}

module.exports = new LogService();