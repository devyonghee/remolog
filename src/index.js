import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

const render = Component => {
    return ReactDOM.render(
        <Component/>,
        document.getElementById('root')
    );
};

render(App);

if (module.hot) {
    module.hot.accept('./App', () => {
        const NextApp = require('./components/App').default;
        render(NextApp);
    });
}