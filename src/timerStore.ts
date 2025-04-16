interface Timer {
  timeoutId: ReturnType<typeof setTimeout>;
  questionId: number;
}

interface TimerStore {
  timers: Timer[];
}

const timerData: TimerStore = {
  timers: []
};

function getTimerData(): TimerStore {
  return timerData;
}

export { getTimerData, Timer };
