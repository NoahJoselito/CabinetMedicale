import Sidebar from "../components/tools/Sidebar";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: { Component: React.ComponentType<any>; pageProps: any }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Component {...pageProps} />
      </div>
    </div>
  );
}