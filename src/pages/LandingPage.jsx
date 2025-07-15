
import React from 'react';
import { motion } from 'framer-motion';
import LandingHeader from '@/components/LandingHeader';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, BarChart, Lightbulb, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };
  
  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Mensagem Enviada!",
      description: "Obrigado por entrar em contato. Retornaremos em breve.",
    });
    e.target.reset();
  };


  return (
    <div className="min-h-screen flex flex-col markone-background text-gray-100 overflow-x-hidden">
      <div className="content-wrapper">
        <LandingHeader scrollToSection={scrollToSection} />

        {/* Hero Section */}
        <motion.section
          id="hero"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-28 pb-20"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 120 }}
            className="flex items-center mb-6"
          >
            <h1            
              className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400"
              style={{ filter: 'drop-shadow(0 0 15px hsla(var(--markone-lines), 0.5))' }}
            >
              MARK <span className="ml-2">ONE</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg md:text-xl text-slate-200 mb-10 max-w-3xl mx-auto"
            style={{ filter: 'drop-shadow(0 0 8px hsla(var(--markone-lines), 0.3))' }}
          >
            Simplificando Processos, Maximizando Resultados.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button size="lg" onClick={() => scrollToSection('solutions')} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl transform hover:scale-105 transition-transform duration-300 px-8 py-3 rounded-full font-semibold">
              Nossas Soluções
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.section>

        {/* Services Section (Solutions) */}
        <section id="solutions" className="py-20 bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-100">Nossos Serviços de Consultoria IoT</motion.h2>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Settings, title: "Implementação IoT", description: "Desenvolvemos e integramos soluções de hardware e software para coleta de dados eficiente." },
                { icon: BarChart, title: "Análise e Visualização", description: "Transformamos dados brutos em insights acionáveis através de dashboards personalizados." },
                { icon: Lightbulb, title: "Soluções Customizadas", description: "Criamos sistemas de monitoramento sob medida para atender às suas necessidades específicas." },
              ].map((service) => (
                <motion.div
                  key={service.title}
                  variants={featureVariants}
                  className="glass-card p-8 rounded-xl text-center card-hover"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full inline-block mb-5 shadow-inner">
                    <service.icon className="h-10 w-10 text-white mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-100">{service.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-100">Sobre Nós</motion.h2>
            <motion.div 
              variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              className="max-w-3xl mx-auto text-center bg-black bg-opacity-20 backdrop-blur-sm p-8 rounded-lg"
            >
              <p className="text-lg text-slate-300 mb-4">
                Na MarkOne, somos apaixonados por tecnologia e inovação. Nossa missão é capacitar empresas com soluções de monitoramento IoT que não apenas coletam dados, mas os transformam em inteligência estratégica.
              </p>
              <p className="text-lg text-slate-300">
                Com uma equipe de especialistas dedicados, combinamos expertise técnica com uma abordagem consultiva para entregar resultados que impulsionam o crescimento e a eficiência dos nossos clientes.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-20 bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-100">Entre em Contato</motion.h2>
            <motion.div 
              variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              className="max-w-2xl mx-auto glass-card p-8 md:p-10 rounded-xl"
            >
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1">Nome Completo</Label>
                  <Input id="name" name="name" type="text" required className="w-full bg-slate-700 bg-opacity-50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Seu nome"/>
                </div>
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">Email</Label>
                  <Input id="email" name="email" type="email" required className="w-full bg-slate-700 bg-opacity-50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" placeholder="seu@email.com"/>
                </div>
                <div>
                  <Label htmlFor="message" className="block text-sm font-medium text-slate-200 mb-1">Sua Mensagem</Label>
                  <Textarea id="message" name="message" rows={4} required className="w-full bg-slate-700 bg-opacity-50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500" placeholder="Como podemos ajudar?"/>
                </div>
                <div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center">
                    Enviar Mensagem <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>


        {/* Footer */}
        <footer className="py-8 text-slate-400 text-center">
          <div className="container mx-auto px-4">
            <p className="mb-2">&copy; {new Date().getFullYear()} MARK ONE Consultoria & Monitoramento. Todos os direitos reservados.</p>
            <p className="text-sm">Transformando dados em inteligência.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
