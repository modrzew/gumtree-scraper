import moment from 'moment';
import React from 'react';
import {render} from 'react-dom';


class Star extends React.Component {
  render () {
    if (this.props.starred) {
      return <i className="glyphicon glyphicon-star"></i>;
    }
    return <i className="glyphicon glyphicon-star-empty"></i>;
  }
}


class Result extends React.Component {
  constructor () {
    super();
    this.state = {starred: false};
  }

  componentWillReceiveProps (props) {
    this.setState({starred: props.starred});
  }

  toggleStar () {
    // TODO: use external lib here, too tired to do that right now zzzzzzz
    var r = new XMLHttpRequest();
    r.open('POST', '/star/' + this.props.eid, true);
    r.onreadystatechange = () => {
      if (r.readyState !== 4 || r.status !== 200) {
        return;
      }
      this.setState({starred: !this.state.starred});
    };
    r.send();
  }

  render () {
    var then = moment(this.props.created_at);
    return (
      <tr>
        <td><img src={this.props.image_url}/></td>
        <td><b>{this.props.price}</b></td>
        <td>
          <Star starred={this.state.starred} />
          <a href={this.props.url} target="_blank"><b>{this.props.title}</b></a><br/>
          <small>{this.props.description}</small>
        </td>
        <td>{then.fromNow(true)}</td>
        <td>
          <a href="#" onClick={this.toggleStar.bind(this)} className="btn btn-sm btn-primary">Star</a>
          <a href="#" className="btn btn-sm btn-danger">Hide</a>
        </td>
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
            <th className="col-xs-1">Price</th>
            <th>Title, description</th>
            <th className="col-xs-1">Age</th>
            <th className="col-xs-1">Actions</th>
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
