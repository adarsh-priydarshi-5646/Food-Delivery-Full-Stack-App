import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Vingo</h3>
            <p className="text-sm mb-4">
              Your favorite food delivered fast and fresh. Order from the best restaurants in your city.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#ff4d2d] transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-[#ff4d2d] transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-[#ff4d2d] transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="hover:text-[#ff4d2d] transition">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#ff4d2d] transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-[#ff4d2d] transition text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#ff4d2d] transition text-sm">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-[#ff4d2d] transition text-sm">
                  Technical Docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-[#ff4d2d] transition text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#ff4d2d] transition text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#ff4d2d] transition text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#ff4d2d] transition text-sm">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-[#ff4d2d] mt-1 flex-shrink-0" />
                <span className="text-sm">Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-[#ff4d2d] flex-shrink-0" />
                <span className="text-sm">+91 1234567890</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-[#ff4d2d] flex-shrink-0" />
                <span className="text-sm break-all">support@vingo.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-center sm:text-left">
              © {currentYear} Vingo. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-[#ff4d2d] transition">
                Privacy
              </a>
              <a href="#" className="hover:text-[#ff4d2d] transition">
                Terms
              </a>
              <a href="#" className="hover:text-[#ff4d2d] transition">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
