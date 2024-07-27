import React, { useState } from 'react';
import Axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './VacationForm.css';

const VacationForm = ({ token }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const vacationData = {
            startDate,
            endDate,
            description,
        };

        try {
            const response = await Axios.post('http://localhost:5000/vacation', vacationData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error adding vacation:', error);
            setMessage('Error adding vacation');
        }
    };

    return (
        <div className="vacation-form">
            <h2>Add Vacation</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Start Date:</label>
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="yyyy-MM-dd" required />
                </div>
                <div>
                    <label>End Date:</label>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="yyyy-MM-dd" required />
                </div>
                <div>
                    <label>Description:</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <button type="submit">Add Vacation</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default VacationForm;
