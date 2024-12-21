import React from 'react';
import PropTypes from 'prop-types';

const DateFormatter = ({ 
    dateString, 
    format = 'DD/MM/YYYY', 
    className = '',
    showError = false 
}) => {
    const formatDate = (date, formatPattern) => {
        if (!date) {
            return showError ? 'Ngày không hợp lệ' : '';
        }

        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return showError ? 'Ngày không hợp lệ' : dateString;
        }

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        switch (formatPattern.toUpperCase()) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY/MM/DD':
                return `${year}/${month}/${day}`;
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`;
            case 'DD.MM.YYYY':
                return `${day}.${month}.${year}`;
            case 'DD THÁNG MM, YYYY':
                return `${day} Tháng ${month}, ${year}`;
            default:
                return `${day}/${month}/${year}`;
        }
    };

    return (
        <span className={className}>
            {formatDate(dateString, format)}
        </span>
    );
};

DateFormatter.propTypes = {
    dateString: PropTypes.string.isRequired,
    format: PropTypes.oneOf([
        'DD/MM/YYYY',
        'MM/DD/YYYY',
        'YYYY/MM/DD',
        'DD-MM-YYYY',
        'DD.MM.YYYY',
        'DD THÁNG MM, YYYY'
    ]),
    className: PropTypes.string,
    showError: PropTypes.bool
};

export default DateFormatter;