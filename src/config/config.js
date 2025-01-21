module.exports = {
  development: {
    username: 'postgres',
    password: 'root',
    database: 'payment_db',
    host: 'localhost',
    dialect: 'postgres',
  },
  production: {
    username: 'root',
    password: 'password',
    database: 'database_name',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
};
