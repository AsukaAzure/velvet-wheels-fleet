import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Luxury Sports Car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Luxury Rentals</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Drive Excellence
              </span>
              <br />
              <span className="text-foreground">Beyond Ordinary</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the pinnacle of automotive luxury with our curated collection of 
              exotic and premium vehicles
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link to="/cars">
                <Button 
                  size="lg" 
                  className="bg-gradient-gold hover:opacity-90 font-semibold text-lg px-8 py-6 shadow-gold group"
                >
                  Explore Fleet
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-6 backdrop-blur-sm"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-8 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all hover:shadow-gold group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Exotic Collection</h3>
              <p className="text-muted-foreground">
                Access the world's most exclusive luxury and exotic vehicles
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all hover:shadow-gold group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Premium Service</h3>
              <p className="text-muted-foreground">
                White-glove service with delivery and collection at your convenience
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all hover:shadow-gold group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Flexible Booking</h3>
              <p className="text-muted-foreground">
                Book by the day, week, or month with competitive rates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
            Ready to Experience Luxury?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join LUXE MOTORS today and elevate your driving experience
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-gold hover:opacity-90 font-semibold text-lg px-12 py-6 shadow-gold"
            >
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
