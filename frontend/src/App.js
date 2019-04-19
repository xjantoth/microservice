import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// import Todos from './components/Todos';
import About from './components/pages/About';
// import AddTodo from './components/AddTodo';
import Header from './components/layout/Header';
import Isalive from './components/Isalive';
import IpAddresses from './components/IpAddresses';
import AddAddress from './components/AddAddress';

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
      //   }
    ],

    isalive: "",
      // {
      //   message: 'Is alive!'
      // }
    
    addresses: [

    ]

}

componentDidMount() {
  // axios.get('https://jsonplaceholder.typicode.com/todos?_limit=2').then(
  //   res => this.setState({todos: res.data})
  // )

  
  axios.get('http://127.0.0.1:5000/api/getallips').then(
    res => this.setState({addresses: res.data})
  ).catch(error => {
      console.log('GET all ipaddresses:' + error)
    })


  axios.get('http://localhost:5000/api/isalive').then(
    res => this.setState({isalive: res.data})
  ).catch(error => {
      console.log('Error:' + error)
    })

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
          <Isalive 
                active={this.state.isalive}
                
            />
          <Route
            exact 
            path="/"
            render={props => (
            <React.Fragment>
            {/* <Todos 
            todos={this.state.todos} 
            markComplete={this.markComplete} 
            delTodo={this.delTodo}
            /> */}

            <IpAddresses 
            allAddress={this.state.addresses}
            />

            {/* <AddTodo addTodo={this.addTodo} /> */}
            <AddAddress />
            
            
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
