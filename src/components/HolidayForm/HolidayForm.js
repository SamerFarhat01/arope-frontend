import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, TextField } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './HolidayForm.css';
import { format } from 'date-fns';

const HolidayForm = ({ token }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [holidays, setHolidays] = useState([]);
    const [editHolidayId, setEditHolidayId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const response = await Axios.get('http://localhost:5000/holidays', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHolidays(response.data);
        } catch (error) {
            console.error('Error fetching holidays:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const holidayData = {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            description,
        };

        try {
            let response;
            if (editHolidayId) {
                response = await Axios.patch(`http://localhost:5000/holidays/${editHolidayId}`, holidayData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                response = await Axios.post('http://localhost:5000/holiday', holidayData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            setMessage(response.data.message);
            fetchHolidays(); // Refresh holidays after adding/editing
            resetForm();
        } catch (error) {
            console.error('Error adding/editing holiday:', error);
            setMessage('Error adding/editing holiday');
        }
    };

    const resetForm = () => {
        setStartDate(null);
        setEndDate(null);
        setDescription('');
        setEditHolidayId(null);
        setModalOpen(false);
    };

    const handleEdit = (holiday) => {
        setStartDate(new Date(holiday.start_date));
        setEndDate(new Date(holiday.end_date));
        setDescription(holiday.description);
        setEditHolidayId(holiday.id);
        setModalOpen(true);
    };

    const handleDateClick = (holiday) => {
        handleEdit(holiday);
    };

    const openModal = () => setModalOpen(true);
    const closeModal = () => resetForm();

    return (
        <div className="holiday-form">
            <h2>Holidays</h2>
            <Button
                variant="contained"
                color="primary"
                onClick={openModal}
                style={{ marginBottom: '20px', float: 'right' }}
            >
                Add Holiday
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {holidays.map((holiday) => (
                            <TableRow key={holiday.id}>
                                <TableCell>{holiday.description}</TableCell>
                                <TableCell onClick={() => handleDateClick(holiday)} style={{ cursor: 'pointer' }}>
                                    {holiday.start_date === holiday.end_date
                                        ? format(new Date(holiday.start_date), 'dd-MM-yyyy')
                                        : `${format(new Date(holiday.start_date), 'dd-MM-yyyy')} >> ${format(new Date(holiday.end_date), 'dd-MM-yyyy')}`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={modalOpen} onClose={closeModal}>
                <Paper className="modal-content">
                    <h2>{editHolidayId ? 'Edit Holiday' : 'Add Holiday'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Start Date:</label>
                            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd-MM-yyyy" required />
                        </div>
                        <div>
                            <label>End Date:</label>
                            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd-MM-yyyy" required />
                        </div>
                        <div>
                            <TextField
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                fullWidth
                            />
                        </div>
                        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
                            {editHolidayId ? 'Update Holiday' : 'Add Holiday'}
                        </Button>
                    </form>
                    {message && <p>{message}</p>}
                </Paper>
            </Modal>
        </div>
    );
};

export default HolidayForm;


