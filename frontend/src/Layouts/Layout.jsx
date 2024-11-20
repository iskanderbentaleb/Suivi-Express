import { Link, Outlet } from "react-router-dom";

function Layout() {
    return (
        <div>
        <header>
            <nav className="bg-gray-200 border-gray-200 dark:bg-gray-900">
            </nav>
        </header>


        <main className="container">
            <Outlet/>
        </main>



        </div>
    );
}

export default Layout;
