import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import About from './components/pages/About';
import Header from './components/layout/Header';
import Isalive from './components/Isalive';
import IpAddresses from './components/IpAddresses';
import AddAddress from './components/AddAddress';


import './App.css';
import axios from 'axios';

class App extends Component {
  state = {
    todos: [],
    isalive: "",
    addresses: [],
    saveToBackend: ""
  }

  componentDidMount() {

    this.fetchData();


  }

  fetchData = () => {
    axios.get('/api/getallips').then(
      res => this.setState({ addresses: res.data })
    ).catch(error => {
      console.log('GET all ipaddresses:' + error)
    });

    axios.get('/api/isalive').then(
      res => this.setState({ isalive: res.data })
    ).catch(error => {
      console.log('Error:' + error)
    });
  }



  saveToFlaskBackend = (e) => {
    e.preventDefault();

    console.log("Save IP address was hit!: ");

    axios.get('/api/saveip').then(
      res => this.setState({ saveToBackend: res.data }, this.fetchData)
    ).catch(error => {
      console.log('saveToBackend:' + error)
    });

    console.log("Message from backend: " + this.state.saveToBackend.message);
  };


  render() {
    return (
      <Router>
        <div className="App">
          <div className="container">
            <Header />
            <Isalive active={this.state.isalive} />
            <IpAddresses allAddress={this.state.addresses}/>
            <AddAddress onSubmit={this.saveToFlaskBackend} />
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
