import React, { Component } from 'react';
import logo from './loop.svg';
import './App.css';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      habits: [],
      habitName: "",
      habitDuration: 21,
    }
  }

  componentWillMount(){
    var habits = JSON.parse(localStorage.getItem('habits'))
    if(habits){
      this.setState({ habits: habits })
    }
  }

  updateHabits(){
    // mark statuses
    var habits = this.state.habits
    var self = this
    habits.map(function(habit, idx){
      // var changedHabit = self.changeHabitStateIfAny(habit)
      if(habit.enabled){
        var changedHabit = self.changeHabitStateIfAny(habit)        
        habits[idx] = changedHabit
      }
    })    
    this.setState({ habits: habits })
  }

  changeHabitStateIfAny(habit){
    var newHabit = habit;
    if(this.habitNotCheckedInTime(habit)){
      newHabit.failed += 1;
      newHabit.enabled = false
    }
    return newHabit;
  }

  addHabit(e){
    e.preventDefault()
    console.log('addHabit')
    var today = new Date();
    var finish_date = new Date();
    finish_date.setDate(today.getDate() + parseInt(this.state.habitDuration))
    var habit = {
      name: this.state.habitName,
      duration: this.state.habitDuration,
      created: today.toString(),
      streak: 0,
      enabled: true,
      failures: 0,
      finish_date: finish_date.toString(),
      last_checked: new Date(2).toString(),
    }
    var habits = this.state.habits;
    habits.push(habit);
    this.setState({ habits: habits });
    localStorage.setItem('habits', JSON.stringify(habits))
    this.resetInputs();
  }

  resetInputs(){
    this.setState({ habitName: "", habitDuration: 21 })
  }

  incompleteHabitExists(){
    this.state.habits.map(function(habit){
      if(this.getStatus(habit) !== 'finished'){
        return true
      }
    })
    return false
  }

  deleteHabit(idx){
    var habits = this.state.habits
    habits.splice(idx, idx + 1) 
    this.setState({
      habits: habits
    })
    localStorage.setItem('habits', JSON.stringify(habits))
  }

  restartHabit(idx){
    var habits = this.state.habits
    var today = new Date();
    var finish_date = new Date();
    finish_date.setDate(today.getDate() + this.state.habitDuration)
    var habit = {
      name: habits[idx].name,
      duration: habits[idx].duration,
      created: today.toString(),
      streak: 0,
      enabled: true,
      failures: 0,
      finish_date: finish_date.toString(),
      last_checked: new Date(1).toString(),
    }
    
    habits[idx] = habit

    this.setState({
      habits: habits
    })
    localStorage.setItem('habits', JSON.stringify(habits))    
  }

  checkboxHabit(habitIndex){
    var habits = this.state.habits;
    console.log()
    if(new Date(habits[habitIndex].last_checked).getFullYear() !== 1969){
      habits[habitIndex].last_checked = new Date(1).toString()
      habits[habitIndex].streak -= 1
    } else {
      habits[habitIndex].last_checked = new Date().toString()
      habits[habitIndex].streak += 1
    }

    this.setState({ habits: habits })
  }

  habitNotCheckedInTime(habit){
    var today = new Date();
    console.log(habit.last_checked)
    if(today.getFullYear() - new Date(habit.last_checked).getFullYear() < 0
    || today.getDate() - new Date(habit.last_checked).getDate() < 0
    || today.getMonth() - new Date(habit.last_checked).getMonth() < 0){
      return true;
    }
    return false;
  }

  getStatus(habit){
    var today = new Date();
    // check if finished
    if(!habit.last_checked){
      return "failed";
    }    
    if(new Date(habit.last_checked).getFullYear() === 1969 && new Date(habit.last_checked).getDay() === 3){
      return 'in progress';
    }
    if(today === habit.finish_date && new Date(habit.last_checked) === today){
      return "finished";
    } 
    if(this.habitNotCheckedInTime(habit)){
      return 'failed';
    }
    // check if not checked in time, and then fail
    console.log('yoo')
    return 'in progress';
  }

  render() {
    console.log('render')
    var self = this;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Habit Maker.</h1>
        </header>
        <p className="App-intro">
          You can add a habit, one at a time. Once you've achieved the habit in the preset duration, 
          then you may add another one. If you have completed a habit for the day, stamp it so you do not lose its streak.
          Otherwise, you will have to start over.
        </p>
        <br/>
        <button onClick={this.updateHabits.bind(this)}>sync</button>
        <br/>
        <br/>
        <table className="habits-table">
          <thead>
            <th>habit</th>
            <th>duration</th>
            <th>created</th>
            <th>streak</th>
            <th>failures</th>
            <th>finish date</th>
            <th>status</th>
            <th>action</th>
            <th></th>
          </thead>
          <tbody>
            {this.state.habits.map(function(habit, idx){
              var checkedView = (
                <input type="checkbox" 
                  onChange={() => self.checkboxHabit(idx)}
                  checked={new Date(habit.last_checked).getFullYear() !== 1969 && 
                    new Date(habit.last_checked).getDay() === new Date().getDay()}
                  disabled={new Date(habit.last_checked).getFullYear() !== 1969 
                    && new Date(habit.last_checked).getDay() === new Date().getDay()
                    && new Date(habit.last_checked).getFullYear() === new Date().getFullYear()
                    && new Date(habit.last_checked).getMonth() === new Date().getMonth()}
                />
              )
              console.log(self.getStatus(habit))
              if(self.getStatus(habit) === "failed"){
                checkedView = (<button onClick={() => self.restartHabit(idx)}>restart</button>)
              }      
              return (
                <tr>
                  <td>{habit.name}</td>
                  <td>{habit.duration} days</td>
                  <td>{habit.created.toString()}</td>
                  <td>{habit.streak}</td>
                  <td>{habit.failures}</td>
                  <td>{habit.finish_date.toString()}</td>
                  <td>{self.getStatus(habit)}</td>
                  <td>{checkedView}</td>
                  <td><button onClick={() => self.deleteHabit(idx)}>delete</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <form className="habitform" onSubmit={this.addHabit.bind(this)}>
          <input
            type="text"
            placeholder="Enter a habit"
            name="habit"
            value={this.state.habitName}
            onChange={(e) => this.setState({ habitName: e.target.value })}
            className="habitinput"
          />
          <input
            type="number"
            min="0"
            max="21"
            placeholder="Duration"
            name="habit"
            value={this.state.habitDuration}
            onChange={(e) => this.setState({ habitDuration: e.target.value })}
            className="habitdurationinput"
          /> days<br/>
          <input 
            type="submit" 
            value="Add Habit" 
            className="habitsubmit"
          />
        </form>
      </div>
    );
  }
}

export default App;
