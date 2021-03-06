import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Presenter from './presenter';

const propTypes = {
    open: PropTypes.bool,
    closeForm: PropTypes.func.isRequired
};

const defaultProps = {
    open: false
};

const container = (props) => {
    const { open, loading, login, closeForm } = props;

    const [values, setValues] = useState({
        id: '',
        password: '',
        showPassword: false,
    });

    const handleKeyPress = e => {
        if (e.key.toLowerCase() !== 'enter') return;
        login(values.id, values.password);
    };

    const handleTextChange = (prop) => (
        (e) => {
            if (values.hasOwnProperty(prop)) setValues({ ...values, [prop]: e.target.value });
        }
    );

    const handleClickShowPassword = e => {
        e.preventDefault();
        setValues({ ...values, showPassword: !values.showPassword });
    };

    return (
        <Presenter
            open={open}
            values={values}
            loading={loading}
            closeForm={closeForm}
            handleKeyPress={handleKeyPress}
            handleConfirmClick={() => login(values.id, values.password)}
            handleTextChange={handleTextChange}
            handleClickShowPassword={handleClickShowPassword}
        />
    );

};

container.propTypes = propTypes;
container.defaultProps = defaultProps;

export default container;