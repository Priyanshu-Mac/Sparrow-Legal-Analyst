import { motion } from 'motion/react';
import { 
  MessageCircle, 
  FileText, 
  Shield, 
  Brain, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Zap, 
  Globe, 
  Award,
  BarChart3,
  Target,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: MessageCircle,
      title: "Instant Answers",
      description: "Ask any legal question and receive accurate, concise answers instantly."
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Upload legal documents to get quick summaries and extract key information."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Built on Google Cloud's secure infrastructure to ensure your data is always protected."
    },
    {
      icon: Brain,
      title: "Always Learning",
      description: "Our AI is continuously trained on new legal information to stay up-to-date and accurate."
    }
  ];

  const problemStats = [
    { value: "70%", label: "Time spent on research" },
    { value: "40%", label: "Repetitive document review" },
    { value: "3hrs", label: "Average daily admin work" },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 50% Time",
      description: "Reduce research time from hours to minutes with instant AI-powered answers.",
      metric: "50% faster"
    },
    {
      icon: TrendingUp,
      title: "Increase Accuracy",
      description: "AI-assisted analysis reduces human error and ensures comprehensive coverage.",
      metric: "95% accuracy"
    },
    {
      icon: Users,
      title: "Scale Your Practice",
      description: "Handle more clients and cases without expanding your team.",
      metric: "3x capacity"
    },
    {
      icon: Target,
      title: "Focus on Strategy",
      description: "Spend less time on research and more time on high-value legal work.",
      metric: "80% strategic work"
    }
  ];

  const impactMetrics = [
    { value: "10,000+", label: "Legal Professionals", icon: Users },
    { value: "2M+", label: "Documents Analyzed", icon: FileText },
    { value: "50%", label: "Time Saved", icon: Clock },
    { value: "99.9%", label: "Uptime", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, #0A2342 0%, #4F86F7 100%)`
          }}
        />
        
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-blue-500/20"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1.1, 1, 1.1]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full border border-blue-400/10"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Centered Text Content */}
          <div className="text-center mb-16 -mt-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
{/* <h1 className="text-4xl md:text-6xl lg:text-6xl font-extrabold text-white text-center leading-tight max-w-4xl mx-auto mb-4">
  Your Legal Assistant <br />
  <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
    Simplified
  </span>
</h1> */}
<h1 className=" text-4xl md:text-6xl lg:text-6xl font-bold mb-8 text-white leading-tight max-w-6xl mx-auto">
                Your Legal Assistant{' '} <br />
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Simplified
                </span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl lg:text-2xl text-gray-300 mb-10 leading-relaxed max-w-4xl mx-auto"
              >
                Sparrow uses Google Cloud AI to provide instant answers, summarize documents, and streamline your legal research with unprecedented accuracy and speed.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="rounded-xl px-10 py-6 text-xl flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-2xl"
                  >
                    <span>Get Started for Free</span>
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </motion.div>
                
                <div className="text-gray-400 text-sm">
                  Free 14-day trial • No credit card required
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1752391873033-839ff56ff6c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbiUyMGRhcmt8ZW58MXx8fHwxNzU3OTU3OTY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Legal AI Technology"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-blue-900/20" />
            </div>
            
            {/* Floating Feature Cards */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 -left-6 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">AI-Powered</div>
                  <div className="text-gray-400 text-xs">Smart Analysis</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -2, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-6 -right-6 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Secure</div>
                  <div className="text-gray-400 text-xs">Enterprise Grade</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Instant</div>
                  <div className="text-gray-400 text-xs">Real-time Results</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 12, 0],
                rotate: [0, -1, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3
              }}
              className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Documents</div>
                  <div className="text-gray-400 text-xs">Smart Review</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              The Legal Industry's Biggest Challenge
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Legal professionals spend countless hours on repetitive tasks, drowning in documents, and struggling with inefficient research methods.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                {problemStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-6 p-6 bg-gray-700 rounded-xl"
                  >
                    <div className="text-4xl font-bold text-blue-400">{stat.value}</div>
                    <div className="text-lg text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1754008368823-1a4cca6358af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMHByb2Zlc3Npb25hbHMlMjB3b3JraW5nJTIwb2ZmaWNlfGVufDF8fHx8MTc1Nzk1Nzk2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Legal professionals working"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Meet Your AI-Powered Solution
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Sparrow transforms how legal professionals work by automating research, analysis, and documentation with cutting-edge AI technology.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Zap,
                title: "Instant Research",
                description: "Get comprehensive legal research results in seconds, not hours."
              },
              {
                icon: Brain,
                title: "Smart Analysis", 
                description: "AI-powered document analysis that understands legal context."
              },
              {
                icon: Globe,
                title: "Always Updated",
                description: "Access to the latest legal information and precedents."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-blue-600">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Powerful Features for Legal Professionals
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Streamline your legal work with AI-powered tools designed for accuracy, security, and efficiency.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-gray-700 border-gray-600 hover:border-blue-500 transition-all duration-300 shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      index % 2 === 0 ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Measurable Benefits for Your Practice
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform your legal practice with quantifiable improvements in efficiency, accuracy, and client satisfaction.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="h-full bg-gradient-to-br from-blue-600 to-blue-800 border-0 text-white shadow-xl">
                  <CardContent className="p-8 text-center">
                    <benefit.icon className="w-12 h-12 mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">{benefit.metric}</div>
                    <h3 className="text-xl font-semibold mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-blue-100 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Making a Real Impact
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of legal professionals who are already transforming their practice with Sparrow.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1730382624709-81e52dd294d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGdyb3d0aCUyMGNoYXJ0c3xlbnwxfHx8fDE3NTc5NTc5Njl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Business growth charts"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {impactMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-6 p-6 bg-gray-700 rounded-xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{metric.value}</div>
                    <div className="text-lg text-gray-300">{metric.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Legal Work?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of legal professionals who trust Sparrow to enhance their productivity and accuracy. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="rounded-xl px-10 py-6 text-xl bg-white hover:bg-gray-100 text-blue-900 font-semibold border-0"
                >
                  Start Using Sparrow Today
                </Button>
              </motion.div>
              <div className="text-blue-100 text-sm">
                Free 14-day trial • No credit card required
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}