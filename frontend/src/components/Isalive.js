import React, { Component } from 'react';

export class Isalive extends Component {
  
    isAlive = () => {
      return {
            "alive": this.props.active.message ? "running" : "stopped",
            background: this.props.active.message ? '#8fbc8f' : '#dc143c',
            color: '#fff',
            textAlign: 'right',
            padding: '4px'
        };
    }
  
    render() {  
    return (
        
        <p style={this.isAlive()}>
            {this.isAlive().alive}
        </p>
        
        
    )
  }
}

export default Isalive





