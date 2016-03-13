import React from 'react';
import {createStore} from 'redux';
import {connect, Provider} from 'react-redux';
import {render} from 'react-dom';
import {TableContainer} from './containers.jsx';


function Reducer (state, action) {
  if (state === undefined) {
    return {results: [], lastEid: null};
  }
  let newState;
  switch (action.type) {
    case 'STAR':
      newState = {lastEid: state.lastEid};
      newState.results = state.results.map((result) => {
        if (result.eid === action.eid) {
          result.starred = !result.starred;
        }
        return result;
      });
      return newState;
    case 'HIDE':
      newState = {lastEid: state.lastEid};
      newState.results = state.results.map((result) => {
        if (result.eid === action.eid && !result.starred) {
          result.hidden = !result.hidden;
        }
        return result;
      });
      return newState;
    case 'NEW_RESULTS':
      newState = {lastEid: state.lastEid};
      // TODO: better way to copy a list?
      newState.results = state.results.map((r) => r);
      let lastEid = state.lastEid;
      for (var result of action.results) {
        if (result.eid <= newState.lastEid) {
          continue;
        }
        newState.results.push(result);
        if (lastEid < result.eid) {
          lastEid = result.eid;
        }
      }
      newState.lastEid = lastEid;
      return newState;
    case 'HIDE_ALL':
      newState = {lastEid: state.lastEid};
      newState.results = state.results.map((result) => {
        if (!result.starred) {
          result.hidden = true;
        }
        return result;
      });
      return newState;
  }
}


let store = createStore(Reducer);

const mapStateToProps = (state) => {
  return {
    results: state.results
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onStar: (eid) => dispatch({type: 'STAR', eid: eid}),
    onHide: (eid) => dispatch({type: 'STAR', eid: eid}),
    onHideAll: () => {
      dispatch({type: 'HIDE_ALL'})
    },
    onNewResults: (results) => dispatch({type: 'NEW_RESULTS', results}),
  };
};


let Container = connect(mapStateToProps, mapDispatchToProps)(TableContainer);
render(
  <Provider store={store}>
    <Container />
  </Provider>,
  document.getElementById('app')
);
