import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <div>

        <main className="container">
            <Outlet/>
        </main>

        </div>
    );
}

export default Layout;
