import React from 'react';
import {render} from 'react-dom';


class Result extends React.Component {
  render () {
    return (
      <tr>
        <td><img src={this.props.image_url}/></td>
        <td><b>{this.props.price}</b></td>
        <td>
          <i className="glyphicon glyphicon-star"></i> <a href="/goto/{this.props.eid}" target="_blank"><b>{this.props.title}</b></a><br/>
          <small>{this.props.description}</small>
        </td>
        <td>{this.props.created_at}</td>
        <td>Actions</td>
      </tr>
    );
  }
}

class TableHeader extends React.Component {
    render () {
      return (
        <thead>
          <tr>
            <th>Image</th>
            <th>Price</th>
            <th>Title, description</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
      );
    }
}

class TableBody extends React.Component {
    render () {
      var rows = this.props.results.map((r) => <Result key={r.eid} {...r}/>);
      return (
        <tbody>
          {rows}
        </tbody>
      );
    }
}


class Table extends React.Component {
  constructor () {
    super();
    this.state = {results: []};
  }

  componentDidMount () {
    var r = new XMLHttpRequest();
    r.open('GET', '/api', true);
    r.onreadystatechange = () => {
      if (r.readyState !== 4 || r.status !== 200) {
        return;
      }
      this.setState({results: JSON.parse(r.responseText)});
    };
    r.send();
  }

  render () {
    return (
      <table className="table table-striped table-bordered table-responsive">
        <TableHeader/>
        <TableBody results={this.state.results}/>
      </table>
    );
  }
}

render(<Table/>, document.getElementById('app'));
