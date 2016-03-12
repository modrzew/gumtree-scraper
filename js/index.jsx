import moment from 'moment';
import React from 'react';
import {render} from 'react-dom';


class Star extends React.Component {
  render () {
    if (this.props.starred) {
      return <i className="glyphicon glyphicon-star" onClick={this.props.onClick}></i>;
    }
    return <i className="glyphicon glyphicon-star-empty" onClick={this.props.onClick}></i>;
  }
}


class Result extends React.Component {
  constructor (props) {
    super();
    this.state = {starred: props.starred, hidden: false};
  }

  hide () {
    var r = new XMLHttpRequest();
    r.open('POST', '/hide/' + this.props.eid, true);
    r.onreadystatechange = () => {
      if (r.readyState !== 4 || r.status !== 200) {
        return;
      }
      this.setState({hidden: !this.state.hidden});
    };
    r.send();
  }

  star () {
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
      <tr className={this.state.hidden ? 'hidden-result' : ''}>
        <td><img src={this.props.image_url}/></td>
        <td><b>{this.props.price}</b></td>
        <td>
          <Star starred={this.state.starred} onClick={this.star.bind(this)} />
          <a href={this.props.url} target="_blank"><b>{this.props.title}</b></a><br/>
          <small>{this.props.description}</small>
        </td>
        <td>{then.fromNow(true)}</td>
        <td>
          <a onClick={this.star.bind(this)} className="btn btn-sm btn-primary">Star</a>
          {(this.state.starred ? '' : <a onClick={this.hide.bind(this)} className="btn btn-sm btn-danger">Hide</a>)}
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
      var rows = this.props.results.map((r) => 
        <Result key={r.eid} {...r}/>
      );
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
        <TableBody results={this.state.results} />
      </table>
    );
  }
}

render(<Table/>, document.getElementById('app'));
