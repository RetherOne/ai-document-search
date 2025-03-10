import React from 'react';
import './ContactStyle.css';

const Contact = () => (
    <div className="contact-main">
        <div className="contact-info">
            <h1>Contacts</h1>
            <div className="contact-info-description">
                <div className="left-column">
                    <div>
                        <h3>Email</h3>
                        <p>General: info@example.com</p>
                        <p>Support: support@example.com</p>
                    </div>
                    <div>
                        <h3>Business Hours</h3>
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                    </div>
                </div>
                <div className="right-column">
                    <div>
                        <h3>Office Address</h3>
                        <p>1234 Book Haven Avenue</p>
                        <p>Suite 567, Literary Heights</p>
                        <p>Fiction City, 54321, USA</p>
                    </div>
                    <div>
                        <h3>Phone Numbers</h3>
                        <p>General Inquiries: +1 (555) 123-4567</p>
                        <p>Support Hotline: +1 (555) 987-6543</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

);

export default Contact;
