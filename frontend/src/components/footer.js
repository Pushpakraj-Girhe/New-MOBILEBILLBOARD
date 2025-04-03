import {Link} from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">AdRoute</h3>
            <p className="text-sm">AI-powered mobile billboard route planning for maximum visibility and ROI.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/plan" className="hover:underline">
                  Plan Your Route
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline">
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline">
                  Support
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:underline">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: info@adroute.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Billboard St, Adville, AD 12345</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} AdRoute. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
