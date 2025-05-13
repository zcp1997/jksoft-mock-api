const supabase = require('../utils/supabaseClient');

class MockService {
  async getAllMocksByProject(projectId) {
    const { data, error } = await supabase
      .from('mocks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getMockById(mockId) {
    const { data, error } = await supabase
      .from('mocks')
      .select('*')
      .eq('id', mockId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createMock(mockData) {
    const { data, error } = await supabase
      .from('mocks')
      .insert([mockData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async updateMock(mockId, mockData) {
    const { data, error } = await supabase
      .from('mocks')
      .update(mockData)
      .eq('id', mockId)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async deleteMock(mockId) {
    const { error } = await supabase
      .from('mocks')
      .delete()
      .eq('id', mockId);
    
    if (error) throw error;
    return { success: true };
  }

  async findMatchingMock(projectUrlSuffix, path, method) {
    // 先找到项目
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('url_suffix', projectUrlSuffix)
      .single();
    
    if (projectError) throw projectError;
    
    if (!project) return null;
    
    // 然后找到对应的mock接口
    const { data: mock, error: mockError } = await supabase
      .from('mocks')
      .select('*')
      .eq('project_id', project.id)
      .eq('path', path)
      .eq('method', method.toUpperCase())
      .single();
    
    if (mockError && mockError.code !== 'PGRST116') throw mockError;
    
    return mock || null;
  }
}

module.exports = new MockService();
