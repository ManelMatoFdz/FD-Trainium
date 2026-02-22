import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import users from '../../users';
import { FormattedMessage } from 'react-intl';
import WrappedButton, { isWrappedVisible } from '../../users/components/WrappedButton';

const Home = () => {
  const loggedIn = useSelector(users.selectors.isLoggedIn);
  const userName = useSelector(users.selectors.getUserName);

  if (!loggedIn) {
    // Landing page para visitantes
    return (
      <div className="home-landing">
        <div className="hero-section">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-text-wrapper">
              <h1 className="hero-title animate-fade-in">
                <FormattedMessage 
                  id="project.home.hero.title" 
                  defaultMessage="Transforma tu Entrenamiento"
                />
              </h1>
              <p className="hero-subtitle animate-fade-in-delay">
                <FormattedMessage 
                  id="project.home.hero.subtitle" 
                  defaultMessage="La plataforma definitiva para entrenadores y atletas. Crea rutinas personalizadas, gestiona ejercicios y lleva tu rendimiento al siguiente nivel."
                />
              </p>
              <div className="hero-cta animate-fade-in-delay-2">
                <Link to="/users/signup" className="btn btn-primary btn-lg cta-primary">
                  <FormattedMessage id="project.home.hero.signup" defaultMessage="Comenzar Ahora" />
                  <i className="fas fa-arrow-right ml-2" />
                </Link>
                <Link to="/users/login" className="btn btn-outline-light btn-lg cta-secondary">
                  <FormattedMessage id="project.home.hero.login" defaultMessage="Iniciar Sesión" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="container">
            <div className="row">
              <div className="col-md-4 feature-card">
                <div className="feature-icon">
                  <i className="fas fa-dumbbell fa-3x" />
                </div>
                <h3>
                  <FormattedMessage id="project.home.feature1.title" defaultMessage="Rutinas Personalizadas" />
                </h3>
                <p>
                  <FormattedMessage 
                    id="project.home.feature1.desc" 
                    defaultMessage="Crea y gestiona rutinas adaptadas a cada objetivo. Control total sobre ejercicios, series y repeticiones."
                  />
                </p>
              </div>
              <div className="col-md-4 feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line fa-3x" />
                </div>
                <h3>
                  <FormattedMessage id="project.home.feature2.title" defaultMessage="Seguimiento Avanzado" />
                </h3>
                <p>
                  <FormattedMessage 
                    id="project.home.feature2.desc" 
                    defaultMessage="Monitoriza tu progreso y el de tus atletas con estadísticas detalladas y visualizaciones claras."
                  />
                </p>
              </div>
              <div className="col-md-4 feature-card">
                <div className="feature-icon">
                  <i className="fas fa-users fa-3x" />
                </div>
                <h3>
                  <FormattedMessage id="project.home.feature3.title" defaultMessage="Gestión Integral" />
                </h3>
                <p>
                  <FormattedMessage 
                    id="project.home.feature3.desc" 
                    defaultMessage="Entrenadores y usuarios conectados. Asigna rutinas, comparte ejercicios y potencia los resultados."
                  />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer integrado para landing */}
        <footer className="home-footer landing-footer">
          <div className="container">
            <p className="footer-text">© Trainium 2025</p>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard para usuario logueado
  return (
    <div className="home-dashboard">
      <div className="welcome-banner">
        <div className="welcome-overlay" />
        <div className="welcome-content">
          <h1 className="welcome-title">
            <FormattedMessage 
              id="project.home.welcome.title" 
              defaultMessage="Bienvenido de nuevo, {name}"
              values={{ name: <span className="user-highlight">{userName}</span> }}
            />
          </h1>
          <p className="welcome-subtitle">
            <FormattedMessage 
              id="project.home.welcome.subtitle" 
              defaultMessage="Listo para continuar tu entrenamiento?"
            />
          </p>
          {isWrappedVisible() && (
            <WrappedButton className="mt-3" />
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="container">
          <div className="motivational-section">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="content-block">
                  <h2 className="content-title">
                    <FormattedMessage 
                      id="project.home.dashboard.motivation.title" 
                      defaultMessage="Tu entrenamiento comienza aquí"
                    />
                  </h2>
                  <p className="content-text">
                    <FormattedMessage 
                      id="project.home.dashboard.motivation.text" 
                      defaultMessage="Cada repetición cuenta. Cada serie suma. Mantén el foco en tus objetivos y convierte el esfuerzo en resultados."
                    />
                  </p>
                  <div className="visual-elements">
                    <div className="element-item">
                      <i className="fas fa-check-circle" />
                      <span>
                        <FormattedMessage id="project.home.dashboard.element1" defaultMessage="Constancia" />
                      </span>
                    </div>
                    <div className="element-item">
                      <i className="fas fa-check-circle" />
                      <span>
                        <FormattedMessage id="project.home.dashboard.element2" defaultMessage="Disciplina" />
                      </span>
                    </div>
                    <div className="element-item">
                      <i className="fas fa-check-circle" />
                      <span>
                        <FormattedMessage id="project.home.dashboard.element3" defaultMessage="Progreso" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="visual-showcase">
                  <div className="showcase-card">
                    <div className="showcase-icon">
                      <i className="fas fa-dumbbell fa-3x" />
                    </div>
                    <h3>
                      <FormattedMessage 
                        id="project.home.dashboard.showcase1.title" 
                        defaultMessage="Entrena con Propósito"
                      />
                    </h3>
                    <p>
                      <FormattedMessage 
                        id="project.home.dashboard.showcase1.desc" 
                        defaultMessage="Cada sesión diseñada para maximizar resultados"
                      />
                    </p>
                  </div>
                  <div className="showcase-card">
                    <div className="showcase-icon">
                      <i className="fas fa-chart-line fa-3x" />
                    </div>
                    <h3>
                      <FormattedMessage 
                        id="project.home.dashboard.showcase2.title" 
                        defaultMessage="Evoluciona Constantemente"
                      />
                    </h3>
                    <p>
                      <FormattedMessage 
                        id="project.home.dashboard.showcase2.desc" 
                        defaultMessage="El progreso es tu mejor motivación"
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="inspiration-banner">
            <div className="inspiration-content">
              <i className="fas fa-quote-left quote-icon" />
              <blockquote className="inspiration-quote">
                <FormattedMessage 
                  id="project.home.dashboard.quote" 
                  defaultMessage="El éxito no es final, el fracaso no es fatal: es el coraje para continuar lo que cuenta."
                />
              </blockquote>
            </div>
          </div>
        </div>

        {/* Footer integrado para dashboard */}
        <footer className="home-footer dashboard-footer">
          <div className="container">
            <p className="footer-text">© Trainium 2025</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;

