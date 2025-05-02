📦 E-Commerce Call Center System
This project is built with Laravel and MySQL for the backend, and React.js for the frontend. It’s designed to manage parcel tracking efficiently after handing over packages to delivery companies.

🔐 User Roles
There are two user roles:

Admin

Agent de Suivi (Tracking Agent)

Both use the same login form.

🚚 Key Features
Track parcel status updates in real-time from agents

Validate, archive, and manage parcels across multiple delivery companies

Import and export orders easily

Communicate with agents through a real-time messaging system powered by Pusher

Centralize parcel tracking in one dashboard

⚙️ Installation Instructions
Follow these steps to install and run the project on your local machine:

Clone the Repository :
<pre>git clone https://github.com/iskanderbentaleb/e-commerce-call-center.git
cd e-commerce-call-center
</pre>


---------------------------------------------------- Backend ----------------------------------------------------

1. Install Backend Dependencies (Laravel- sacntume)
<pre>
cd backend
composer install
cp .env.example .env
php artisan key:generate
</pre>

2. Set Up Environment Variables : Update your .env file with your database credentials.
<pre>
DB_CONNECTION=
DB_HOST=
DB_PORT=
DB_DATABASE=e-commerce-call-center 
DB_USERNAME=root
DB_PASSWORD=
</pre>


3. Set up your Pusher credentials in .env:
<pre>
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST="api-eu.pusher.com"
PUSHER_APP_CLUSTER="eu"
PUSHER_PORT=443
PUSHER_SCHEME=https
</pre>



4. Run Migrations
<pre>
php artisan migrate
</pre>

5. Run Laravel Server
<pre>
php artisan serve
</pre>


---------------------------------------------------- Frontend ----------------------------------------------------

1. Install Frontend Dependencies (React JS)
<pre>
cd frontend
npm install
cp .env.example .env
</pre>


2. Set Up Environment Variables : Set up your Pusher credentials in .env:
<pre>
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=api-eu.pusher.com
PUSHER_APP_CLUSTER=eu
PUSHER_PORT=443
PUSHER_SCHEME=https
</pre>


3. Run the Frontend
<pre>
npm run dev
</pre>


![0](./screenshot/0.png)
![1](./screenshot/1.png)
![2](./screenshot/2.png)
![3](./screenshot/3.png)
![4](./screenshot/4.png)
![5](./screenshot/5.png)
![6](./screenshot/6.png)
![7](./screenshot/7.png)
![8](./screenshot/8.png)
![9](./screenshot/9.png)




