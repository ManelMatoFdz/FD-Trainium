import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Body from "./Body";
import Footer from "./Footer";
import Header from "./Header";
import "./Header.css";
import { useDispatch } from 'react-redux';
import backend from '../../../backend';
import * as actions from '../../users/actions';


const App = () => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const isAuthPage = pathname.startsWith('/users/login') || pathname.startsWith('/users/signup');
  const isHomePage = pathname === '/' || pathname === '';
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthPage) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isAuthPage]);

  useEffect(() => {
    backend.userService.tryLoginFromServiceToken(
        () => {
          dispatch(actions.logout());
        },
        (user) => {
          dispatch(actions.loginCompleted(user));
        }
    );
  }, [dispatch]);

  return (
    <div>
      {!isAuthPage && <Header/>}
      {isAuthPage ? (
        <div className="auth-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background-trainium.png)` }}>
          <div className="auth-brand">
            <Link to="/" className="auth-brand-link" aria-label="Ir al inicio (Trainium)">
              <div className="brand-logo-wrapper d-flex align-items-center justify-content-center">
                <img
                  src={process.env.PUBLIC_URL + '/trainium-logo-2.png'}
                  width="48"
                  height="48"
                  className="brand-logo"
                  alt="Trainium"
                  onError={(e) => { e.currentTarget.style.opacity = '0.35'; }}
                />
              </div>
            </Link>
          </div>
          <div className="auth-container">
            <Body/>
          </div>
          <Footer auth={true}/>
        </div>
      ) : (
        <>
          <Body/>
          {!isHomePage && <Footer/>}
        </>
      )}
      <ToastContainer
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
    </div>
  );
};

export default App;
