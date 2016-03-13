import moment from 'moment';
import React from 'react';
import {Image, Table} from './components.jsx';


export class Result extends React.Component {
  // TODO: split this component into ResultContainer and Result
  constructor (props) {
    super();
    this.state = {starred: props.starred, hidden: false, seen: props.seen};
  }

  componentWillReceiveProps (props) {
    // The only thing that may come from its parent is callback after clicking
    // "Hide all" button. So we don't actually need to check anything, but we
    // don't want to hide starred offers.
    if (props.hidden && !this.state.starred) {
      this.setState({hidden: true});
    }
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


export class HideAllButton extends React.Component {
  hideAll () {
    var r = new XMLHttpRequest();
    r.open('POST', '/hide/all', true);
    r.onreadystatechange = () => {
      if (r.readyState !== 4 || r.status !== 200) {
        return;
      }
      this.props.callback();
    };
    r.send();
  }

  render () {
    return <a className="btn btn-lg btn-warning" onClick={this.hideAll.bind(this)}>Hide all unstarred</a>;
  }
}


export class TableContainer extends React.Component {
  refresh () {
    var r = new XMLHttpRequest();
    r.open('GET', '/api', true);
    r.onreadystatechange = () => {
      if (r.readyState !== 4 || r.status !== 200) {
        return;
      }
      this.props.onNewResults(JSON.parse(r.responseText))
      // Reload every minute
      setTimeout(this.refresh.bind(this), 60000);
    };
    r.send();
  }

  componentDidMount () {
    this.refresh();
  }

  render () {
    return <Table {...this.props} />;
  }
}
