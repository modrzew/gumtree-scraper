import moment from 'moment';
import React from 'react';
import {ResultContainer, HideAllButton} from './containers.jsx';


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


export class Result extends React.Component {
  render () {
    var then = moment(this.props.created_at).add(10, 'hours');
    return (
      <tr className={this.props.hidden ? 'hidden-result' : ''}>
        <td className={this.props.starred ? 'image starred' : 'image'}>
          <Image
            src={this.props.image_url}
            starred={this.props.starred}
            hidden={this.props.hidden}
            hideCallback={this.props.hideCallback}
            starCallback={this.props.starCallback} />
        </td>
        <td className="price"><b>{this.props.price}</b></td>
        <td className="description">
          <h3>
            {this.props.seen ? <i className="glyphicon glyphicon-ok" title="Already seen" /> : ''}{' '}
            <a href={this.props.url} target="_blank" onClick={this.props.seenCallback}><b>{this.props.title}</b></a>
          </h3>
          <p><small>{this.props.description}</small></p>
        </td>
        <td>{then.fromNow(true)}</td>
      </tr>
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
        <ResultContainer key={r.eid} {...r}/>
      );
      return (
        <tbody>
          {this.props.results.map((r) =>
            <ResultContainer
              key={r.eid}
              onStar={this.props.onStar}
              onHide={this.props.onHide}
              onSeen={this.props.onSeen}
              {...r}/>
          )}
        </tbody>
      );
    }
}


export class Table extends React.Component {

  showAll () {
    var r = new XMLHttpRequest();
    r.open('POST', '/show/all', true);
    r.onreadystatechange = () => {
      if (r.readyState !== 4 || r.status !== 200) {
        return;
      }
      window.location = window.location
    };
    r.send();
  }

  render () {
    return (this.props.results.length ?
      <div>
        <table className="table table-striped table-bordered table-responsive">
          <TableHeader/>
          <TableBody
            results={this.props.results}
            onStar={this.props.onStar}
            onHide={this.props.onHide}
            onSeen={this.props.onSeen}/>
        </table>
        <p className="text-center">
          <HideAllButton callback={this.props.onHideAll} />
        </p>
      </div>
      :
      <div>
        <p className="text-center">
          No results yet! Make sure that scrapper is running in the background
          and wait for a couple of minutes.
        </p>
        <a className="btn btn-lg btn-warning" onClick={this.showAll.bind(this)}>Show all</a>
      </div>
    );
  }
}
