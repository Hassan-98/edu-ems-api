const dbConnection = require('../configs/db.config');

const createSession = async () => {
  const connection = await dbConnection;

  const db = connection.connections[0];

  const session = await db.startSession();
  
  return session;
}

module.exports = createSession;