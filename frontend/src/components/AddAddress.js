import React, { Component } from 'react';
import axios from 'axios';

export class AddAddress extends Component {

    state = {
        saveToBackend: ""
    }
    
    saveToFlaskBackend = (e) => {
        e.preventDefault();
        
        console.log("Save IP address was hit!: " + e) ;
        
        axios.get('http://localhost:5000/api/saveip').then(
            res => this.setState({saveToBackend: res.data})
            ).catch(error => {
                console.log('saveToBackend:' + error)
      });

        console.log("Message from backend: " + this.state.saveToFlaskBackend) ;
    };
    
    render() {
    return (
      <form 
      onSubmit={this.saveToFlaskBackend}
      style={{ display: 'flex' }}>
          
          <input
          type="submit"
          value="Save IP address"
          className="btn"
          style={{flex: '1'}}
          
        />
            
          
      </form>
    )
  }
}

export default AddAddress
