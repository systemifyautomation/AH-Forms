import { useState } from 'react';

const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Company Information
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    
    // Project Details
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
    
    // Additional Information
    howDidYouHear: '',
    preferredContact: '',
    additionalNotes: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send formData to your backend here
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: 'Personal' },
      { num: 2, label: 'Company' },
      { num: 3, label: 'Project' },
      { num: 4, label: 'Additional' },
    ];

    return (
      <div className="mb-10">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step.num
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.num ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.num ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                    currentStep > step.num ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-gray-500">Let's start with the basics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="input-field"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Doe"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="input-field"
          placeholder="john@example.com"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="input-field"
          placeholder="+1 (555) 000-0000"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h3>
        <p className="text-gray-500">Tell us about your organization</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          className="input-field"
          placeholder="Acme Inc."
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Size *</label>
          <select
            name="companySize"
            value={formData.companySize}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="">Select industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="input-field"
          placeholder="https://www.example.com"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h3>
        <p className="text-gray-500">What can we help you with?</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Type *</label>
        <select
          name="projectType"
          value={formData.projectType}
          onChange={handleInputChange}
          className="input-field"
          required
        >
          <option value="">Select project type</option>
          <option value="consulting">Consulting</option>
          <option value="development">Development</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
          <option value="support">Ongoing Support</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range *</label>
          <select
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="">Select budget</option>
            <option value="5k-10k">$5,000 - $10,000</option>
            <option value="10k-25k">$10,000 - $25,000</option>
            <option value="25k-50k">$25,000 - $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="100k+">$100,000+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeline *</label>
          <select
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="">Select timeline</option>
            <option value="asap">ASAP</option>
            <option value="1-month">Within 1 month</option>
            <option value="1-3-months">1-3 months</option>
            <option value="3-6-months">3-6 months</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="input-field min-h-[120px] resize-none"
          placeholder="Please describe your project requirements, goals, and any specific needs..."
          required
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h3>
        <p className="text-gray-500">Almost done! Just a few more details</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about us?</label>
        <select
          name="howDidYouHear"
          value={formData.howDidYouHear}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value="">Select an option</option>
          <option value="search">Search Engine</option>
          <option value="social">Social Media</option>
          <option value="referral">Referral</option>
          <option value="advertisement">Advertisement</option>
          <option value="event">Event/Conference</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Contact Method</label>
        <div className="flex flex-wrap gap-4">
          {['Email', 'Phone', 'Video Call'].map((method) => (
            <label key={method} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="preferredContact"
                value={method.toLowerCase().replace(' ', '-')}
                checked={formData.preferredContact === method.toLowerCase().replace(' ', '-')}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700 group-hover:text-primary-600 transition-colors">{method}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          className="input-field min-h-[100px] resize-none"
          placeholder="Anything else you'd like us to know?"
        />
      </div>
      
      {/* Summary Preview */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>
            <span className="ml-2 text-gray-900">{formData.firstName} {formData.lastName}</span>
          </div>
          <div>
            <span className="text-gray-500">Company:</span>
            <span className="ml-2 text-gray-900">{formData.companyName}</span>
          </div>
          <div>
            <span className="text-gray-500">Project:</span>
            <span className="ml-2 text-gray-900">{formData.projectType || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-500">Budget:</span>
            <span className="ml-2 text-gray-900">{formData.budget || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Your submission has been received. Our team will review your information and get back to you within 24-48 hours.
      </p>
      <div className="space-y-4">
        <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Confirmation email sent to {formData.email}
        </div>
      </div>
      <button
        onClick={() => {
          setIsSubmitted(false);
          setCurrentStep(1);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            companyName: '',
            companySize: '',
            industry: '',
            website: '',
            projectType: '',
            budget: '',
            timeline: '',
            description: '',
            howDidYouHear: '',
            preferredContact: '',
            additionalNotes: '',
          });
        }}
        className="mt-8 btn-secondary"
      >
        Submit Another Response
      </button>
    </div>
  );

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="card">
          {isSubmitted ? (
            renderSuccessMessage()
          ) : (
            <form onSubmit={handleSubmit}>
              {renderProgressBar()}
              
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Continue
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Submit Application
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default OnboardingForm;
