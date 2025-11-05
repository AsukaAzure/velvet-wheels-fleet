import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Gauge, Zap, Clock, ShoppingCart } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/auth");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select rental dates");
      return;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    const rentalDays = differenceInDays(endDate, startDate);

    const { error } = await supabase.from("cart_items").upsert({
      user_id: user.id,
      car_id: id!,
      rental_days: rentalDays,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    });

    if (error) {
      toast.error("Failed to add to cart");
      return;
    }

    toast.success("Added to cart!");
    navigate("/cart");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl">Car not found</h1>
        </div>
      </div>
    );
  }

  const rentalDays = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const totalPrice = rentalDays * Number(car.price_per_day);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              {car.image_url && (
                <img 
                  src={car.image_url} 
                  alt={car.name}
                  className="w-full h-[500px] object-cover rounded-lg shadow-luxury"
                />
              )}
            </div>

            <div className="space-y-6 animate-slide-up">
              <div>
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  {car.segment.toUpperCase()}
                </Badge>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
                  {car.name}
                </h1>
                <p className="text-xl text-muted-foreground">{car.brand}</p>
              </div>

              {car.description && (
                <p className="text-foreground leading-relaxed">{car.description}</p>
              )}

              <Card className="bg-secondary border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {car.horsepower && (
                      <div className="text-center">
                        <Gauge className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{car.horsepower}</p>
                        <p className="text-sm text-muted-foreground">Horsepower</p>
                      </div>
                    )}
                    {car.top_speed && (
                      <div className="text-center">
                        <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{car.top_speed}</p>
                        <p className="text-sm text-muted-foreground">Top Speed (mph)</p>
                      </div>
                    )}
                    {car.acceleration && (
                      <div className="text-center">
                        <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{car.acceleration}</p>
                        <p className="text-sm text-muted-foreground">0-60 mph</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Select Rental Period</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Start Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "End Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => !startDate || date <= startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Price per day:</span>
                      <span className="text-xl font-semibold">${car.price_per_day}</span>
                    </div>
                    {rentalDays > 0 && (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground">Rental days:</span>
                          <span className="text-xl font-semibold">{rentalDays}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-3xl font-bold text-primary">${totalPrice}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-gold hover:opacity-90 font-semibold"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
