import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('数据库连接成功');

    // 读取SQL文件
    const sqlFile = await fs.readFile(
      path.join(__dirname, 'database.sql'),
      'utf8'
    );

    // 分割SQL语句
    const statements = sqlFile
      .split(';')
      .filter(statement => statement.trim());

    // 执行每个SQL语句
    for (const statement of statements) {
      await connection.query(statement);
      console.log('执行SQL语句成功');
    }

    console.log('数据库初始化完成');
    await connection.end();
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initializeDatabase(); 