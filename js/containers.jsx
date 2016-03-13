import React from 'react';
import {Image, Table, Result} from './components.jsx';


export class ResultContainer extends React.Component {
  hide () {
    if (this.props.starred) {
      return;
    }
    var r = new XMLHttpRequest();
    r.open('POST', '/hide/' + this.props.eid, true);
    r.onreadystatechange = () => {
      if (r.readyState !== 4 || r.status !== 200) {
        return;
      }
      this.props.onHide(this.props.eid);
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
      this.props.onStar(this.props.eid);
    };
    r.send();
  }

  seen () {
    this.props.onSeen(this.props.eid);
  }

  render () {
    return <Result
      hideCallback={this.hide.bind(this)}
      starCallback={this.star.bind(this)}
      seenCallback={this.seen.bind(this)}
      {...this.props} />;
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
