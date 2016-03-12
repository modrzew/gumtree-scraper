import moment from 'moment';
import React from 'react';
import {render} from 'react-dom';


class Star extends React.Component {
  render () {
    if (this.props.starred) {
      return <i className="glyphicon glyphicon-star" onClick={this.props.onClick}/>;
    }
    return <i className="glyphicon glyphicon-star-empty" onClick={this.props.onClick}/>;
  }
}


class Image extends React.Component {
  constructor(props) {
    super();
    this.state = {src: props.src || 'https://baconmockup.com/150/100/'}
  }

  render () {
    return (
      <div className="wrapper">
        <div className="starred-indicator">
          <i className="glyphicon glyphicon-star"/>
        </div>
        <div className="actions">
          <Star starred={this.props.starred} onClick={this.props.starCallback}/>
          {this.props.starred ? '' : <i className="glyphicon glyphicon-remove" onClick={this.props.hideCallback}/>}
        </div>
        <img src={this.state.src} />
      </div>
    );
  }
}


class Result extends React.Component {
  constructor (props) {
    super();
    this.state = {starred: props.starred, hidden: false, seen: props.seen};
  }

  hide () {
    if (this.state.starred) {
      return;
    }
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

  markAsSeen () {
    this.setState({seen: true});
  }

  render () {
    var then = moment(this.props.created_at);
    return (
      <tr className={this.state.hidden ? 'hidden-result' : ''}>
        <td className={this.state.starred ? 'image starred' : 'image'}>
          <Image
            src={this.props.image_url}
            starred={this.state.starred}
            hidden={this.state.hidden}
            hideCallback={this.hide.bind(this)}
            starCallback={this.star.bind(this)} />
        </td>
        <td className="price"><b>{this.props.price}</b></td>
        <td className="description">
          <h3>
            {this.state.seen ? <i className="glyphicon glyphicon-ok" title="Already seen" /> : ''}{' '}
            <a href={this.props.url} target="_blank" onClick={this.markAsSeen.bind(this)}><b>{this.props.title}</b></a>
          </h3>
          <p><small>{this.props.description}</small></p>
        </td>
        <td>{then.fromNow(true)}</td>
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
