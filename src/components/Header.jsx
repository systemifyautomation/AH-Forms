const Header = () => {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AH</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Amington Hall</h1>
              <p className="text-xs text-gray-500">Client Onboarding</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Services
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <button className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
