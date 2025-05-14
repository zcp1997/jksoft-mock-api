const { createClient } = require('@supabase/supabase-js');
const { fetch } = require('undici');
const { ProxyAgent } = require('undici'); // Use undici's ProxyAgent instead
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const proxyUrl = process.env.HTTP_PROXY || '';
const useProxy = !!proxyUrl;

const customFetch = async (url, options = {}) => {
  if (useProxy) {
    //console.log(`[Fetch] Using proxy for: ${url}`);
    //console.log(`[Fetch] Proxy: ${proxyUrl}`);
    
    // Create a dispatcher using undici's ProxyAgent
    const agent = new ProxyAgent(proxyUrl);
    options.dispatcher = agent;
  } else {
    //console.log(`[Fetch] Direct fetch: ${url}`);
  }
  
  try {
    const res = await fetch(url, options);
    //console.log(`[Fetch] Response: ${res.status} ${res.statusText}`);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: customFetch }
});

module.exports = supabase;