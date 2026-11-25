import { render } from 'preact';
import { App } from './components/App/App';
import { Setup } from './components/Setup/Setup';
import { runsFromPackage } from './lib/setup/setup';
import './styles/variables.css';
import './styles/global.css';

render(runsFromPackage() ? <Setup /> : <App />, document.getElementById('root')!);
