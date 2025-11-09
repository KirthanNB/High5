import Image from 'next/image';

export default function AboutPage() {
  const teamMembers = [
    { name: 'Kirthan', role: 'Backend Manager' },
    { name: 'Shreyas Patil', role: 'UI Designer' },
    { name: 'Vinay S', role: 'UX Builder' },
    { name: 'Rohith M', role: 'Components Manager' },
    { name: 'Chethan K', role: 'All-Rounder' },
    { name: 'Narasimha Murthy', role: 'Summarizer' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="mx-auto mb-6">
          <Image src="/team.jpg" alt="High5" width={80} height={80} className="mx-auto rounded-full opacity-80" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">About High5</h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          High5 makes NASA research understandable and engaging for everyone through concise AI summaries,
          interactive visualizations, and learner-first design.
        </p>
      </section>

      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-blue-900/40" />
      </div>

      <section className="container mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-300">Our Mission</h2>
        <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
          We bridge the gap between complex space science and curious minds. From students to educators and
          lifelong explorers, our tools simplify discovery with clear explanations, visuals, and quizzes.
        </p>
      </section>

      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-blue-900/40" />
      </div>

      <section className="container mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-300">Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-[#0B3D91]/10 border border-blue-900 hover:border-blue-700 transition-colors rounded-xl p-5 text-center backdrop-blur-sm"
            >
              <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border border-blue-700">
                <Image src="/team.jpg" alt={member.name} width={80} height={80} className="object-cover w-full h-full" />
              </div>
              <div className="font-semibold text-blue-200 text-lg">{member.name}</div>
              <div className="text-gray-400 text-sm">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-blue-900/40" />
      </div>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-blue-300">Get in Touch</h2>
        <p className="text-gray-300 mb-6">Questions or ideas? We would love to connect.</p>
        <a
          href="mailto:kirthannb@gmail.com"
          className="inline-block bg-[#0B3D91] px-6 py-3 rounded-full font-semibold hover:bg-[#061f49] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
        >
          Email Us
        </a>
      </section>
    </div>
  );
}
