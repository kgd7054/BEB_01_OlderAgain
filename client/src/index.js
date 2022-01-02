import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';

import App from './App';

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
