import "../styles/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// injecting navbar and footer into the app
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 md:px-8">
        <div className="m-2 sm:m-3 md:m-4 lg:m-6">
          <Component {...pageProps} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default MyApp;
