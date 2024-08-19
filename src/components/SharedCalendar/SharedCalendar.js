import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './SharedCalendar.css';

const localizer = momentLocalizer(moment);

const SharedCalendar = ({ token, onClose }) => {
    const [events, setEvents] = useState([]);
    const [calendarOverlay, setCalendarOverlay] = useState(false);
    const [calendarOverlayEvents, setCalendarOverlayEvents] = useState([]);

    useEffect(() => {
        const fetchDepartmentLeaves = async () => {
            try {
                const response = await Axios.get('http://localhost:5000/department-leaves', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const filteredLeaves = response.data.filter(
                    leave => leave.request_status !== 'Rejected' && leave.request_status !== 'Cancelled'
                );

                // Flatten the leave dates to separate events for each date
                const leaves = filteredLeaves.flatMap(leave => {
                    const leaveDates = leave.leave_date.split(','); // Assuming leave.leave_date is a comma-separated string of dates
                    return leaveDates.map(date => {
                        let title = `${leave.employee_name} - ${leave.type_of_leave}`;
                        if (leave.duration == 0.5) {
                            title += ` (${leave.time === 'AM' ? 'Morning' : 'Afternoon'})`;
                        } else {
                            title += ` (Full Day)`;
                        }

                        return {
                            key: leave.employee_id + "-" + new Date(date),
                            title,
                            // start: new Date(date).toISOString().split('T')[0],
                            date: new Date(date).toISOString().split('T')[0],
                            allDay: leave.duration === 1,
                            leaveType: leave.type_of_leave,
                            requestStatus: leave.request_status,
                            duration: leave.duration,
                        };
                    });
                });
                console.log(leaves);
                setEvents(leaves);
            } catch (error) {
                console.error('Error fetching department leaves:', error);
            }
        };

        fetchDepartmentLeaves();
    }, [token]);

    const eventStyleGetter = (event, start, end, isSelected) => {

        let backgroundColor = '#4CAF50';

        console.log(event)
        
        if(event.leaveType.includes("Sick Leave")){
            backgroundColor = 'yellow'
        }
        if (event.requestStatus === 'Pending Manager') {
            backgroundColor = 'lightgrey';
        }
        const style = {
            backgroundColor,
            opacity: 0.8,
            color: 'black',
            border: '0px',
        };
        return {
            style,
        };
    };

    const handleCalendarOverlay = (events, date) => {
        setCalendarOverlay(true);
        setCalendarOverlayEvents(events);
    };

    const closeOverlay = () => {
        setCalendarOverlay(false);
    };

    return (
        <div style={{ height: '500px', width: '100%', margin: '0 auto', position: 'relative', padding: '15px'  }}>
            <button className="close-button" onClick={onClose}>X</button>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="date"
                endAccessor="date"
                onSelectEvent={e => console.log(e)}
                views={['month', 'agenda']}
                style={{ height: '500px', width: '100%' }}
                eventPropGetter={eventStyleGetter}
                onShowMore={(events, date) => handleCalendarOverlay(events, date)}
            />
            {calendarOverlay && (
                <div id="calendar-overlay">
                    <ul className='calendar-overlay__list'>
                        <button className="overlay-close-button" onClick={closeOverlay}>X</button>
                        <h2>{calendarOverlayEvents[0].date}</h2>
                        {calendarOverlayEvents.map((e) => (
                            <li key={e.key}>{e.title}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SharedCalendar;
