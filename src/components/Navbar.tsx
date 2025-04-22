import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          MyLogo
        </Link>
        <div className="space-x-4">
          <Link href="#features" className="hover:text-blue-600">
            Features
          </Link>
          <Link href="#projects" className="hover:text-blue-600">
            Projects
          </Link>
          <Link href="#contact" className="hover:text-blue-600">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
