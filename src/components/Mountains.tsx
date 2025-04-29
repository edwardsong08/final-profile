export default function Mountains() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className="w-full h-full"
    >
      {/* Moved tallest mountain to right side */}
      <polygon fill="#c39493" stroke="white" strokeWidth="1" points="1449 450 1031 900 1888 900" />
      <polygon fill="#932e2e" stroke="white" strokeWidth="1" points="1449 450 1364.9 900 1888 900" />
      
      {/* Rest remains unchanged */}
      <polygon fill="#b1b0b0" stroke="white" strokeWidth="1" points="-60 900 398 662 816 900" />
      <polygon fill="#744e4d" stroke="white" strokeWidth="1" points="337 900 398 662 816 900" />
      <polygon fill="#8a7d7a" stroke="white" strokeWidth="1" points="1203 546 1552 900 876 900" />
      <polygon fill="#76453f" stroke="white" strokeWidth="1" points="1203 546 1552 900 1162 900" />
      <polygon fill="#d4d3cf" stroke="white" strokeWidth="1" points="641 695 886 900 367 900" />
      <polygon fill="#756b63" stroke="white" strokeWidth="1" points="587 900 641 695 886 900" />
      <polygon fill="#688462" stroke="white" strokeWidth="1" points="1710 900 1401 632 1096 900" />
      <polygon fill="#515f47" stroke="white" strokeWidth="1" points="1710 900 1401 632 1365 900" />
      <polygon fill="#96be9a" stroke="white" strokeWidth="1" points="1210 900 971 687 725 900" />
      <polygon fill="#29592c" stroke="white" strokeWidth="1" points="943 900 1210 900 971 687" />
    </svg>
  );
}
