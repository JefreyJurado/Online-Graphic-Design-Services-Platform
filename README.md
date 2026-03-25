# Online Graphic Design Services Platform

A full-stack web application where clients can request graphic design quotations, attach reference images, and track their project status.

**Live Site:** https://jefrey-design.vercel.app

---

## About This Project

This platform allows users to:
- Browse available graphic design services
- Submit quotation requests (with or without registration)
- Search and attach design reference images from Unsplash
- Track quotation status and receive email notifications
- Upload profile pictures and manage account settings

Administrators can:
- View all quotation requests
- Update quotation status and set pricing
- Add notes for clients
- Approve or reject revision requests

Built as a terminal assessment for **MO-IT149 Web Technology Application** course.

---

## Key Features

- **Google OAuth Login** - Sign in with Google account
- **Guest Submissions** - Request quotes without registration
- **Reference Images** - Search Unsplash and attach up to 5 images per quote
- **File Upload** - Profile pictures stored on AWS S3
- **Email Notifications** - Automatic updates via Gmail
- **Mobile Responsive** - Works on all devices
- **Secure Authentication** - JWT tokens with bcrypt password hashing
- **Role-Based Access** - Separate admin and client permissions

---

## Built With

**Frontend:**
- HTML, CSS, JavaScript
- Bootstrap 5

**Backend:**
- Node.js & Express.js
- MongoDB Atlas
- Mongoose

**External Services:**
- AWS S3 (file storage)
- Google OAuth 2.0 (authentication)
- Unsplash API (reference images)
- Gmail SMTP (email notifications)

**Deployed on:** Vercel

---

## Live Deployment

- **Frontend:** https://jefrey-design.vercel.app
- **Backend API:** https://online-graphic-design-services-plat.vercel.app

---

## Security Features

- JWT authentication with 7-day expiration
- bcrypt password hashing
- Input validation on all forms
- Rate limiting to prevent abuse
- Role-based access control (admin/client)
- Secure file upload with type and size validation

---

## Testing

- 24 test cases covering all features
- 100% pass rate
- Mobile compatibility tested on iOS and Android
- All critical bugs fixed before deployment

---

## Author

**Jefrey T. Jurado**

- Course: MO-IT149 Web Technology Application
- Institution: Mapua-Malayan Digital College
- GitHub: [@JefreyJurado](https://github.com/JefreyJurado)

---

## License

This project is created for educational purposes as part of the MO-IT149 course.

---

**Note:** This is an academic project demonstrating full-stack development with cloud services integration (AWS S3, Google OAuth, MongoDB Atlas, Unsplash API).
