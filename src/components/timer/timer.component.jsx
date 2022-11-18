import { Component } from "react";

import './timer.styles.css';

class Timer extends Component {
  constructor() {
    super();

    this.state = {
      milliseconds: '00',
      secconds: '00',
      minutes: '00',
      hours: '00',
      intervalID: null,
      currentTimer: 0,
      startDate: 0,
      endDate: 0,
      history: []
    }
  }

  componentDidMount = () => {
    const loadedHistory = JSON.parse(localStorage.getItem(this.getLocalStorageDailyKey()))

    if (loadedHistory !== null) {
      const currentTimer = loadedHistory.reduce((previousValue, timer) => {
        return previousValue + this.calculateMilliseconds(
          timer.startDate,
          timer.endDate
        )
      }, 0)

      this.setState({
        history: loadedHistory,
        currentTimer
      }, () => {
        this.updateTime(currentTimer)
      })
    }
  }

  componentWillUnmount = () => {
    window.addEventListener('beforeunload', (event) => {
      if (this.state.intervalID !== null) {
        event.preventDefault()
        this.stopTimer()
      }
    })
  }

  startTimer = () => {
    if (this.state.intervalID === null) {
      this.setState({ startDate: Date.now() }, () => {
        const intervalID = setInterval(() => {
          this.updateTime(this.state.currentTimer)
        }, 10)

        this.setState({ intervalID })
      })
    }
  }

  updateTime = (currentTimer) => {
    const timer = currentTimer + (this.state.startDate !== 0 ? this.calculateMilliseconds(this.state.startDate, Date.now()) : 0)

    this.setState({
      milliseconds: String(timer % 100).padStart(2, '0'),
      secconds: String(Math.floor(timer / 100) % 60).padStart(2, '0'),
      minutes: String(Math.floor(timer / 6000) % 60).padStart(2, '0'),
      hours: String(Math.floor(timer / 36000)).padStart(2, '0'),
    })
  }

  stopTimer = () => {
    const intervalID = this.state.intervalID

    if (intervalID !== null) {
      clearInterval(intervalID)
      const endDate = Date.now()

      this.setState({
        intervalID: null,
        endDate,
        currentTimer: this.state.currentTimer + this.calculateMilliseconds(this.state.startDate, endDate)
      }, () => {
        const startDate = this.state.startDate
        const endDate = this.state.endDate
        const history = this.state.history
        history.push({ startDate: startDate, endDate: endDate })

        this.setState({ history }, () => {
          this.upsertLocalStorageTimerData()
        })
      })
    }
  }

  resetTimer = () => {
    const shouldReset = window.confirm("Do you really want to reset the timer? All today's data is going to be lost")

    if (shouldReset) {
      this.setInitialState()
      localStorage.removeItem(this.getLocalStorageDailyKey())
    }
  }

  setInitialState() {
    this.setState({
      milliseconds: '00',
      secconds: '00',
      minutes: '00',
      hours: '00',
      intervalID: null,
      currentTimer: 0,
      startDate: 0,
      endDate: 0,
      history: []
    })
  }

  getLocalStorageDailyKey() {
    const date = new Date()
    return date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate()
  }

  upsertLocalStorageTimerData() {
    const key = this.getLocalStorageDailyKey()
    const currentHistory = localStorage.getItem(key)

    if (currentHistory === null) {
      localStorage.setItem(key, JSON.stringify(this.state.history))
    } else {
      localStorage.removeItem(key)
      localStorage.setItem(key, JSON.stringify(this.state.history))
    }
  }

  calculateMilliseconds(startDate, endDate) {
    return Math.round((endDate - startDate) / 10)
  }

  render() {
    let button

    if (this.state.intervalID === null)
      button = <button className="timerbox-button" onClick={this.startTimer}>Start</button>
    else
      button = <button className="timerbox-button" onClick={this.stopTimer}>Stop</button>

    return (
      <div className="timerbox">
        <h2 className="timerbox-tittle">Timer</h2>
        <p className="timerbox-timer"><span>{this.state.hours}:{this.state.minutes}:{this.state.secconds}</span> {this.state.milliseconds}</p>
        <div className="timerbox-buttons">
          {button}
          <button className="timerbox-button" onClick={this.resetTimer}>Reset</button>
        </div>
      </div>
    )
  }
}

export default Timer
