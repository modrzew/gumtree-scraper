import React from 'react';
import {Result} from './containers.jsx';


class Star extends React.Component {
  render () {
    if (this.props.starred) {
      return <i className="glyphicon glyphicon-star" onClick={this.props.onClick}/>;
    }
    return <i className="glyphicon glyphicon-star-empty" onClick={this.props.onClick}/>;
  }
}


export class Image extends React.Component {
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


export class TableHeader extends React.Component {
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

export class TableBody extends React.Component {
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
