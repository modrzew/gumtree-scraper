import React from 'react';
import {createStore} from 'redux';
import {connect, Provider} from 'react-redux';
import {render} from 'react-dom';
import {Table} from './containers.jsx';


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
      });
      return newState;
    case 'HIDE':
      newState = {lastEid: state.lastEid};
      newState.results = state.results.map((result) => {
        if (result.eid === action.eid && !result.starred) {
          result.hidden = !result.hidden;
        }
      });
      return newState;
    case 'NEW_RESULTS':
      return state;
    case 'HIDE_ALL':
      newState = {lastEid: state.lastEid};
      newState.results = state.results.map((result) => {
        if (!result.starred) {
          result.hidden = true;
        }
      });
      return newState;
  }
}


let store = createStore(Reducer);

const mapStateToProps = (state) => {
  return {
    results: state
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onStar: (eid) => dispatch({type: 'STAR', eid: eid})
  };
};

const ContainerTable = connect(mapStateToProps, mapDispatchToProps)(Table);


render(
  <Provider store={store}>
    <ContainerTable/>
  </Provider>,
  document.getElementById('app')
);
