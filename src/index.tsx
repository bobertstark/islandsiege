import React from 'react';
import ReactDOM from 'react-dom/client';

const root = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(root);


function App() {
    return (
	<div>
	    <h1>Hello from Island Siege</h1>
	</div>
    )

}

reactRoot.render(<App />);
