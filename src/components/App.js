import '../styles/App.css';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { toggleMenu } from '../actions/UIActions';
import { login } from '../actions/UserActions';
import Overview from '../components/Overview';
import SearchBox from '../components/SearchBox';
import LoginBox from '../components/LoginBox';
import Icon from '../components/Icon';

const MENU_ITEMS = ['Karriere', 'BDB', 'Møter', 'Utland', 'Spørreskjema', 'Butikk'];

export default class App extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    menuOpen: PropTypes.bool.isRequired,
    search: PropTypes.object.isRequired
  }

  render() {
    const { dispatch, menuOpen, search, auth } = this.props;
    return (
      <section>
        <header className='Header'>
          <div className='Header-content u-container'>
            <div className='Header-logo'><Link to=''>Abakus</Link></div>
            <div className='Header-searchBox'><SearchBox {...{ search, dispatch }}/></div>
            <div className='Header-partnerLogo'><a href='http://bekk.no'>Bekk</a></div>
            <div className='Header-login'>
              <LoginBox
                login={(u, p) => dispatch(login(u, p))}
                userInfo={auth.userInfo}
              />
            </div>
          </div>
        </header>

        <nav className='MainNavigation'>
          <ul className='MainNavigation-list u-container'>
            <li><Link to=''>Oversikt</Link></li>
            <li><Link to='events'>Arrangementer</Link></li>
            <li>
              <a onClick={() => dispatch(toggleMenu())} className={menuOpen ? 'active' : ''}>
                <Icon name={menuOpen ? 'times' : 'bars'} />
              </a>
            </li>
          </ul>
        </nav>

        <div className='u-relative u-container'>
          {menuOpen && <div className='ExtendedNavigation'>
            {MENU_ITEMS.map((item, i) => <a href='#' key={i}>{item}</a>)}
          </div>}
        </div>

        {this.props.children || <Overview {...this.props} />}

        <footer>
          <p>Abakus er best</p>
        </footer>
      </section>
    );
  }
}
