import { MantineProvider } from '@mantine/core';
import { RouterProvider } from "react-router-dom"
import { router } from "./Router/index"
import UserContext from "./context/UserContext"
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css';

export const theme = {
    colorScheme: 'light', // or 'dark'
    primaryColor: 'x_color', // Change this to your preferred color (e.g., 'red', 'green', 'purple', etc.)
    colors: {
      x_color: [
        "#f1f4fe",
        "#e4e6ed",
        "#c8cad3",
        "#a9adb9",
        "#9094a3",
        "#7f8496",
        "#777c91",
        "#656a7e",
        "#595e72",
        "#4a5167"
      ]
      // Define additional custom colors if needed
    },
};


function App() {
  return (
    <>
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <UserContext>
          <RouterProvider router={router}/>
          <Notifications />
        </UserContext>
     </MantineProvider>
    </>
  )
}

export default App
