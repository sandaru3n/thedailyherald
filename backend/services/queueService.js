const getBuiltInQueue = require('./builtInQueue');

module.exports = function() {
  // In production, always use built-in queue
  if (process.env.NODE_ENV === 'production') {
    return getBuiltInQueue();
  }

  // In development, try to load external services
  try {
    return require('./databaseIndexingQueue');
  } catch (e) {
    try {
      return require('./articleIndexingQueue');
    } catch (e) {
      return getBuiltInQueue();
    }
  }
};