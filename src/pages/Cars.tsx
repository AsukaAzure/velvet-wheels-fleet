import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Gauge, Zap, Clock } from "lucide-react";

export default function Cars() {
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState<string>("all");

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars", selectedSegment],
    queryFn: async () => {
      let query = supabase.from("cars").select("*").eq("available", true);
      
      if (selectedSegment !== "all") {
        query = query.eq("segment", selectedSegment as "exotic" | "sedan" | "sports" | "suv");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-gold bg-clip-text text-transparent">
              Our Exclusive Fleet
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience automotive excellence with our curated selection of luxury vehicles
            </p>
          </div>

          <Tabs value={selectedSegment} onValueChange={setSelectedSegment} className="mb-12">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 bg-secondary">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sedan">Sedan</TabsTrigger>
              <TabsTrigger value="suv">SUV</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="exotic">Exotic</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <div className="h-64 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars?.map((car, index) => (
                <Card 
                  key={car.id} 
                  className="group bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-gold cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/cars/${car.id}`)}
                >
                  <div className="relative overflow-hidden h-64">
                    {car.image_url && (
                      <img 
                        src={car.image_url} 
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                      {car.segment.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {car.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {car.brand}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      {car.horsepower && (
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-primary" />
                          <span>{car.horsepower}HP</span>
                        </div>
                      )}
                      {car.top_speed && (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>{car.top_speed}mph</span>
                        </div>
                      )}
                      {car.acceleration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{car.acceleration}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-3xl font-bold text-primary">
                          ${car.price_per_day}
                        </span>
                        <span className="text-sm text-muted-foreground">/day</span>
                      </div>
                      <Button className="bg-gradient-gold hover:opacity-90">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
