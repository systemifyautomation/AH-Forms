import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import OnboardingForm from './components/OnboardingForm';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <OnboardingForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
