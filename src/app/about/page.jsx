import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gradient-to-br from-[#0B3D91] to-black">
        <div className="absolute inset-0 bg-[url('/stars.png')] opacity-30"></div>
        <div className="container mx-auto px-6 h-full flex items-center justify-center">
          <div className="text-center z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Meet Team High5</h1>
            <p className="text-xl text-blue-300">Democratizing Space Research for Everyone</p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-400 mb-8">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            High5 was born from a vision to bridge the gap between NASA's cutting-edge research 
            and global audiences. We believe that space science should be accessible to everyone, 
            from curious students to seasoned researchers.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-[#0B3D91]/20 p-6 rounded-xl border border-blue-900">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Innovation</h3>
              <p className="text-gray-400">
                Leveraging AI and interactive visualizations to transform complex research into 
                digestible content.
              </p>
            </div>
            <div className="bg-[#0B3D91]/20 p-6 rounded-xl border border-blue-900">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Education</h3>
              <p className="text-gray-400">
                Creating engaging learning experiences through quizzes, visualizations, and 
                community interaction.
              </p>
            </div>
            <div className="bg-[#0B3D91]/20 p-6 rounded-xl border border-blue-900">
              <h3 className="text-xl font-bold text-blue-300 mb-4">Community</h3>
              <p className="text-gray-400">
                Building a global network of space enthusiasts, researchers, and learners.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-[#061f49]/30 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="bg-black/50 p-6 rounded-xl border border-blue-900 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600"></div>
                <h3 className="text-xl font-bold text-blue-300">Team Member {member}</h3>
                <p className="text-gray-400 mt-2">Role Description</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-400 mb-8">Get In Touch</h2>
          <p className="text-gray-300 mb-8">
            Have questions or want to contribute? We'd love to hear from you!
          </p>
          <a 
            href="mailto:contact@high5.space" 
            className="inline-block bg-[#0B3D91] px-8 py-3 rounded-full hover:bg-[#061f49] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}