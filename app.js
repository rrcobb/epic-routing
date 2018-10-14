import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router';
import { Link } from 'react-router-dom';
import { Provider, connect } from 'react-redux';
import { updateUser } from './userId';
import { createBrowserHistory } from 'history';
import rootstore from './rootstore';
import initializeNavigation from './plumbing';

console.log('Starting the app! This is the root!');
const history = createBrowserHistory();
initializeNavigation(rootstore, history);

const Button = props =>
  <a
    style={{
      margin: 10,
      padding: 3,
      border: '1px solid blue',
      cursor: 'pointer',
      borderRadius: '2px',
      color: 'black',
    }}
    onClick={props.onClick}>
    {props.children}
  </a>;

const Users = props => {
  let { userId, updateUser } = props;
  return (
    <div>
      <span>
        Current User: {userId}
      </span>
      <div style={{ margin: 10 }}>
        <Button onClick={() => updateUser(1)}>Choose user 1</Button>
        <Button onClick={() => updateUser(2)}>Choose user 2</Button>
        <Button onClick={() => updateUser(3)}>Choose user 3</Button>
      </div>
    </div>
  );
};

const UserPage = connect(
  state => ({
    userId: state.userId,
  }),
  { updateUser }
)(Users);

const Home = () =>
  <div>
    <span>Epic Routing Demo</span>
    <About />
    <UserPage />
  </div>;

const About = () =>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span>
      See the <a href="https://gitpitch.com/rrcobb/epic-routing/master?grs=github">slides</a>
    </span>
    <span>
      Check it out on <a href="https://github.com/rrcobb/epic-routing">github</a>
    </span>
    <span>
      Click the buttons, watch the url, and try navigating with the browser's forward and back
      actions.
    </span>
  </div>;

const App = () =>
  <Provider store={rootstore}>
    <Router history={history}>
      <div>
        <Route exact path="/" component={Home} />
      </div>
    </Router>
  </Provider>;

ReactDOM.render(<App />, document.getElementById('react-root'));
