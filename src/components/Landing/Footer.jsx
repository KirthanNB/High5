import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-6 text-center border-t border-slate-700 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Image
          src="/team.jpg"  // Path to your team logo
          alt="High5 Team Logo"
          width={80}       // Adjust size as needed
          height={80}
          className="rounded-full"
        />
        <p>© {new Date().getFullYear()} SpaceBio Search Engine Dashboard. Built with 💙 by your High5 Team.</p>
      </div>
    </footer>
  );
}
