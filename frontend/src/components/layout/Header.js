import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
    const headerStyle = {
        background: '#333',
        color: '#fff',
        textAlign: 'center',
        padding: '10px'
  
    }

    const linkStyle = {
        color: '#fff',
        textDecoration: 'none'
    }

    return (
    <header style={headerStyle}>
      <h1>Flask micro-service in Kubernetes</h1>
      <Link style={linkStyle} to="/app">Home</Link> | <Link style={linkStyle} to="/about">About</Link>
    </header>
  )

  
}

