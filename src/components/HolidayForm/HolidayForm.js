import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, TextField, Typography, Box, IconButton } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import './HolidayForm.css';

const HolidayForm = ({ token }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [holidays, setHolidays] = useState([]);
    const [editHolidayId, setEditHolidayId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const [editMode, setEditMode] = useState(false);

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
            if (editMode && description) {
                response = await Axios.patch(`http://localhost:5000/holidays/${description}`, holidayData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else if (addMode) {
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
        setAddMode(false);
        setEditMode(false);
    };

    const handleEdit = (holiday) => {
        console.log('Holiday clicked:', holiday);
        setStartDate(new Date(holiday.start_date));
        setEndDate(new Date(holiday.end_date));
        setDescription(holiday.description);
        console.log('Set description to:', holiday.description);
        setEditMode(true);
        setModalOpen(true);
        setMessage(''); // Clear message when editing
    };

    const handleAdd = () => {
        setAddMode(true);
        setModalOpen(true);
        setMessage(''); // Clear message when adding
    };

    const closeModal = () => resetForm();

    useEffect(() => {
        console.log('Modal title - editMode:', editMode, 'addMode:', addMode);
    }, [editMode, addMode]);

    return (
        <div className="holiday-form">
            <h2>Holidays</h2>
            <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
                style={{ marginBottom: '20px', float: 'right' }}
            >
                Add Holiday
            </Button>
            <TableContainer component={Paper} className="table-container">
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
                                <TableCell onClick={() => handleEdit(holiday)} style={{ cursor: 'pointer' }}>
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
                <Box className="modal-content">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{editMode ? 'Edit Holiday' : 'Add Holiday'}</Typography>
                        <IconButton onClick={closeModal} className="close-button">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Box mt={2}>
                            <TextField
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                InputProps={{
                                    readOnly: editMode,
                                }}
                                fullWidth
                                required
                            />
                        </Box>
                        <Box mt={2}>
                            <label>Start Date:</label>
                            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd-MM-yyyy" required />
                        </Box>
                        <Box mt={2}>
                            <label>End Date:</label>
                            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd-MM-yyyy" required />
                        </Box>
                        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
                            {editMode ? 'Update Holiday' : 'Add Holiday'}
                        </Button>
                    </form>
                </Box>
            </Modal>
            {message && <Typography mt={2} align="center">{message}</Typography>}
        </div>
    );
};

export default HolidayForm;
