// import { MantineProvider } from '@mantine/core';
// import { RouterProvider } from "react-router-dom"
// import { router } from "./Router/index"
// import UserContext from "./context/UserContext"
// import '@mantine/core/styles.css';
// import { Notifications } from '@mantine/notifications'
// import '@mantine/notifications/styles.css';
// import { ModalsProvider } from '@mantine/modals';

// export const theme = {
//   colorScheme: 'light', // You can switch to dark if needed
//   primaryColor: 'blue', // Example primary color
//   colors: {
//     blue: ['#eff8ff', '#d4e9ff', '#a5c8ff', '#7ba8ff', '#4e88ff', '#2670f4', '#1055e3', '#0644c6', '#0538a7', '#042d87'],
//     // Define your own colors if needed
//   },
//   headings: {
//     fontFamily: 'Arial, sans-serif', // Custom font for headings
//   },
//   components: {
//     Header: {
//       styles: {
//         root: {
//           backgroundColor: '#ffffff', // White background for the header
//           color: '#333333', // Dark text color for the header
//         },
//       },
//     },
//     Navbar: {
//       styles: {
//         root: {
//           backgroundColor: '#f4f4f4', // Light gray background for the left bar
//           color: '#333333', // Dark text color for the left bar
//         },
//       },
//     },
//     Main: {
//       styles: {
//         root: {
//           backgroundColor: '#eff0f5ff', // Light background for main content
//           color: '#333333', // Dark text color for the main content
//         },
//       },
//     },
//   },
// };





// export default function App() {
//   return (
//     <>
//     <MantineProvider theme={theme}  withGlobalStyles withNormalizeCSS>
//         <UserContext>
//           <ModalsProvider>
//             <RouterProvider router={router}/>
//             <Notifications />
//           </ModalsProvider>
//         </UserContext>
//      </MantineProvider>
//     </>
//   )
// }


import { useEffect, useState } from "react";
import echo from "./../src/services/resources/echo"; // Import correctly

const App = () => {
  const [mails, setMails] = useState([]);

  useEffect(() => {
    console.log("📡 Connecting to Echo...");
  
    const channel = echo.channel("chat"); // 🔴 Change from `channel` to `private`
  
    channel.listen(".MessageSent", (data) => {
      console.log("🔥 New Mail Received:", data);
      setMails((prev) => [...prev, data.mail]);
    });
  
    return () => {
      console.log("❌ Stopping Listener...");
      channel.stopListening(".MessageSent");
    };
  }, []);
  

  return (
    <div>
      <h1>Real-Time Mail</h1>
      {mails.length === 0 && <p>🔄 Waiting for messages...</p>}
      {mails.map((mail, index) => (
        <div key={index}>
          <p><strong>From:</strong> {mail.sender_admin_id}</p>
          <p><strong>To:</strong> {mail.receiver_admin_id}</p>
          <p><strong>Message:</strong> {mail.message}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default App;
