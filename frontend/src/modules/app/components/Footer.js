import PropTypes from 'prop-types';

const Footer = ({ auth = false }) => (

    <div className={auth ? 'footer-auth' : ''}>
        {!auth && (<>
            <br/>
            <hr/>
        </>)}
        <footer>
            <p className="text-center">
                © Trainium 2025
            </p>
        </footer>
    </div>

);

Footer.propTypes = {
    auth: PropTypes.bool
};

export default Footer;
