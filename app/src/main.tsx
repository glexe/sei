import { render } from 'preact';
import { App } from './components/App/App';
import './styles/variables.css';
import './styles/global.css';

render(<App />, document.getElementById('root')!);
