import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";


export class IpAddresses extends Component {


  render() {
    const columns = [
      { Header: 'ID', accessor: 'id' },
      { Header: 'IPaddress', accessor: 'ipaddress' },
      { Header: 'Created', accessor: 'created' }

    ];

    return (
      <div>
        <div className="tableDesc">Records from PostgreSQL:</div>
        <ReactTable className="reactTable"
          data={this.props.allAddress}
          columns={columns}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 30, 60, 100]}
        />
      </div>
    )


  }
}

export default IpAddresses
