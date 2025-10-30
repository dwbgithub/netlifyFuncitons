const { Pool } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_jUePN2bJsC8T@ep-rough-voice-ad7rnzns-pooler.c-2.us-east-1.aws.neon.tech/neondb';
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: true
  }
});
exports.handler = async (event) => {
  let client = null;
  try {
    // 从连接池获取一个数据库客户端
    client = await pool.connect();
    
    // POST请求：插入数据
    if (event.httpMethod === 'GET') {
      try {  
        const result1 = await client.query(`SELECT count FROM dwb.log_sum LIMIT 1`);
        const count = result1.rows[0].count;
        const countv = count + 1;
        const query = `update dwb.log_sum set count = ${countv} where id = 1 `;
        await client.query(query);
        const result11 = await client.query(`SELECT count FROM dwb.log_sum LIMIT 1`);
        const count1 = result11.rows[0].count;
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            message: '数据插入成功',
            data: count1
          })
        };
      } catch (parseError) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: '请求体格式错误，请提供有效的JSON',
            error: parseError.message
          })
        };
      }
    }
    
    // 不支持的HTTP方法
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Allow': 'GET, POST'
      },
      body: JSON.stringify({
        success: false,
        message: '不支持的HTTP方法'
      })
    };
    
  } catch (error) {
    console.error('数据库操作错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: '服务器内部错误',
        error: error.message
      })
    };
  } finally {
    // 确保客户端被释放回连接池
    if (client) {
      client.release();
    }
  }
};
