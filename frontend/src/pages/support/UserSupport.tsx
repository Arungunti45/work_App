import React from 'react';
import { Routes, Route } from 'react-router-dom';

const TicketList = () => <div><h2>My Support Tickets</h2><p>List of your support tickets will appear here.</p></div>;
const NewTicket = () => <div><h2>Create Support Ticket</h2><p>Submit a new request for help.</p></div>;
const TicketDetail = () => <div><h2>Ticket Details</h2><p>View and reply to your support ticket.</p></div>;

export const UserSupport: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Support Center</h1>
      <Routes>
        <Route path="/" element={<TicketList />} />
        <Route path="/new" element={<NewTicket />} />
        <Route path="/:ticketId" element={<TicketDetail />} />
      </Routes>
    </div>
  );
};
