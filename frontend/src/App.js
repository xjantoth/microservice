import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Todos from './components/Todos';
import About from './components/pages/About';
import AddTodo from './components/AddTodo';
import Header from './components/layout/Header';
// import uuid from 'uuid';
import './App.css';
import axios from 'axios';

class App extends Component {
  state = {
    todos: [
      //   {
      //       id: uuid.v4(),
      //       title: 'Take out the trash',
      //       completed: false
      //   },
      //   {
      //     id: uuid.v4(),
      //     title: 'Dinner with wife',
      //     completed: false
      // },
      // {
      //     id: uuid.v4(),
      //     title: 'Meeting with boss',
      //     completed: false
      // },
      // {
      //     id: uuid.v4(),
      //     title: 'Meeting with me',
      //     completed: false
      // }
    ]
}

componentDidMount() {
  axios.get('https://jsonplaceholder.typicode.com/todos?_limit=17').then(
    res => this.setState({todos: res.data})
  )
}

// Toggle Complete
markComplete = (id) => {
  // console.log('id: ' + id)
  this.setState({
    todos: this.state.todos.map(todo => {
      if (todo.id === id) {
        todo.completed = !todo.completed
      }
      return todo;
    })
   });
}

// Delete Todo
delTodo = (id) => {
  // console.log('delete: ' + id)
  // this.setState({ 
  //   todos: [...this.state.todos.filter(
  //     todo => todo.id !== id)] });

  axios.delete(`https://jsonplaceholder.typicode.com/todos/${id}`).then(
    res => this.setState({
      todos: [...this.state.todos.filter(
        todo => todo.id !== id
      )]
    })
  );

}


// Add Todo
addTodo = (title) => {
  // console.log('title: ' + title)
  
  // const newTodo = {
  //   id: uuid.v4(),
  //   title: title,
  //   completed: false

  // }
  
  // this.setState({
  //   todos: [...this.state.todos, newTodo]
  // });

  axios.post('https://jsonplaceholder.typicode.com/todos', {
    title: title,
    completed: false
  }).then(
      res => this.setState({
        todos: [...this.state.todos, res.data]
      })
  );
}

 
  render() {
    return (

      <Router>
      
        <div className="App">
          <div className="container">
          <Header />
          
          <Route
            exact 
            path="/"
            render={props => (
                <React.Fragment>
                  <Todos 
            todos={this.state.todos} 
            markComplete={this.markComplete} 
            delTodo={this.delTodo}
          />

          <AddTodo addTodo={this.addTodo} />
                </React.Fragment>
            )}
          />
          
          <Route 
            path="/about"
            component={About}
          />
          
          
          </div>
          
        </div>
      
      
      </Router>
    );
  }
}

export default App;
