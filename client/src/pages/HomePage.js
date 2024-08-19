import React, {useEffect, useState} from 'react';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {

    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

      useEffect(() => {
          const fetchData = async () => {
             await axios.get('http://localhost:5000/api/reservation')
                  .then(response => {
                      setReservations(response.data);
                  })
                  .catch(error => {
                      setError('Failed to load data');
                  });
          }


        fetchData();
      }, []);

    const toggleRow = (uuid) => {
        setExpandedRow(expandedRow === uuid ? null : uuid);
    };

    return (
        <div>
            {error && <div className="error">{error}</div>}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                <tr>
                    <th>Reservation UUID</th>
                    <th>Number of Active Purchases</th>
                    <th>Sum of Active Charges</th>
                </tr>
                </thead>
                <tbody>
                {reservations.map(reservation => (
                    <React.Fragment key={reservation.reservation_uuid}>
                        <tr onClick={() => toggleRow(reservation.reservation_uuid)} style={{ cursor: 'pointer', borderBottom: '1px solid black' }}>
                            <td>{reservation.reservation_uuid}</td>
                            <td>{reservation.numActivePurchases}</td>
                            <td>{reservation.sumActiveCharges}</td>
                            <td>
                                <FontAwesomeIcon icon={expandedRow === reservation.reservation_uuid ? faChevronUp : faChevronDown} />
                            </td>
                        </tr>
                        {expandedRow === reservation.reservation_uuid && (
                            <tr>
                                <td colSpan="3" style={{ borderBottom: '1px solid black' }}>
                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Status</th>
                                            <th>Charge</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {reservation.products.map((product, index) => (
                                            <tr key={index} style={{ backgroundColor: product.status === 'active' ? 'green' : product.status === 'cancelled' ? 'red' : '' }}>
                                                <td>{product.product_name}</td>
                                                <td>{product.status == 'not found' ? '' : product.status}</td>
                                                <td>{product.amount !== null ? product.amount : ''}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default HomePage;
