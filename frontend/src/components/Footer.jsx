import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-xl font-semibold text-stone-900">
              Clavier
            </Link>
            <p className="mt-3 text-sm text-stone-500">
              Premium mechanical keyboards for professionals and enthusiasts.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-stone-900 mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-sm text-stone-500 hover:text-stone-900">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=mechanical" className="text-sm text-stone-500 hover:text-stone-900">
                  Mechanical
                </Link>
              </li>
              <li>
                <Link to="/shop?category=wireless" className="text-sm text-stone-500 hover:text-stone-900">
                  Wireless
                </Link>
              </li>
              <li>
                <Link to="/shop?category=gaming" className="text-sm text-stone-500 hover:text-stone-900">
                  Gaming
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-stone-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="text-sm text-stone-500 hover:text-stone-900">
                  Order Status
                </Link>
              </li>
              <li>
                <span className="text-sm text-stone-500">Contact Us</span>
              </li>
              <li>
                <span className="text-sm text-stone-500">FAQ</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-stone-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-stone-500">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-stone-500">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-400 text-center">
            © {new Date().getFullYear()} Clavier. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;