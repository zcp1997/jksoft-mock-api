const supabase = require('../utils/supabaseClient');

class ProjectService {
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getProjectById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async updateProject(id, projectData) {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }

  async getProjectByUrlSuffix(urlSuffix) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('url_suffix', urlSuffix)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
}

module.exports = new ProjectService();
