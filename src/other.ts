import { getData, setData } from './dataStore';
import { getTimerData } from './timerStore';

/**
 * Reset the state of the application back to the start
 *
 * @param none
 *
 * @returns {object} - Empty object
 */
function clear(): { error?: string } {
  const database = getData();
  const timers = getTimerData();

  // reset all the dataset so that the database is empty
  database.user = [];
  for (const timer of timers.timers) {
    clearTimeout(timer.timeoutId);
  }
  database.quizzes = [];
  database.trash = [];
  timers.timers = [];

  setData(database);

  return {};
}

export { clear };
