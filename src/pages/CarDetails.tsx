import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Zap, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [rentalDays, setRentalDays] = useState(1);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnDate, setReturnDate] = useState<Date>();
  const [returnTime, setReturnTime] = useState("10:00");
  const [returnLocation, setReturnLocation] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (pickupDate && returnDate) {
      const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
      setRentalDays(days > 0 ? days : 1);
    }
  }, [pickupDate, returnDate]);

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

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      if (!pickupDate || !returnDate) {
        throw new Error("Please select pickup and return dates");
      }

      if (!pickupLocation.trim() || !returnLocation.trim()) {
        throw new Error("Please enter pickup and return locations");
      }

      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        car_id: id,
        rental_days: rentalDays,
        pickup_date: pickupDate.toISOString().split('T')[0],
        pickup_time: pickupTime,
        pickup_location: pickupLocation,
        return_date: returnDate.toISOString().split('T')[0],
        return_time: returnTime,
        return_location: returnLocation,
        start_date: pickupDate.toISOString().split('T')[0],
        end_date: returnDate.toISOString().split('T')[0],
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added to cart!");
      navigate("/cart");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

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

  if (!car) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <img 
                src={car.image_url} 
                alt={car.name}
                className="w-full h-[500px] object-cover rounded-lg shadow-luxury"
              />
            </div>

            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  {car.segment.toUpperCase()}
                </Badge>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-royal bg-clip-text text-transparent">
                  {car.name}
                </h1>
                <p className="text-xl text-muted-foreground">{car.brand}</p>
              </div>

              {car.description && (
                <p className="text-foreground">{car.description}</p>
              )}

              <Card className="bg-secondary border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {car.horsepower && (
                      <div className="text-center">
                        <Gauge className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{car.horsepower}</p>
                        <p className="text-sm text-muted-foreground">HP</p>
                      </div>
                    )}
                    {car.top_speed && (
                      <div className="text-center">
                        <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{car.top_speed}</p>
                        <p className="text-sm text-muted-foreground">mph</p>
                      </div>
                    )}
                    {car.acceleration && (
                      <div className="text-center">
                        <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{car.acceleration}</p>
                        <p className="text-sm text-muted-foreground">0-60</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Book Your Ride</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickup-date">Pickup Date *</Label>
                        <Input
                          id="pickup-date"
                          type="date"
                          value={pickupDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            setPickupDate(date);
                            if (returnDate && date > returnDate) {
                              setReturnDate(undefined);
                            }
                          }}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pickup-time">Pickup Time *</Label>
                        <Input
                          id="pickup-time"
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="pickup-location">Pickup Location *</Label>
                      <Input
                        id="pickup-location"
                        type="text"
                        placeholder="Enter pickup location"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="return-date">Return Date *</Label>
                        <Input
                          id="return-date"
                          type="date"
                          value={returnDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => setReturnDate(new Date(e.target.value))}
                          min={pickupDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                          disabled={!pickupDate}
                        />
                      </div>
                      <div>
                        <Label htmlFor="return-time">Return Time *</Label>
                        <Input
                          id="return-time"
                          type="time"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="return-location">Return Location *</Label>
                      <Input
                        id="return-location"
                        type="text"
                        placeholder="Enter return location"
                        value={returnLocation}
                        onChange={(e) => setReturnLocation(e.target.value)}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Rental Days:</span>
                        <span className="font-semibold">{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg">Total:</span>
                        <p className="text-3xl font-bold text-primary">
                          ₹{(car.price_per_day * rentalDays).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => addToCart.mutate()} 
                    disabled={!pickupDate || !returnDate || !pickupLocation.trim() || !returnLocation.trim() || addToCart.isPending}
                    className="w-full mt-4 bg-gradient-royal hover:opacity-90"
                  >
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
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
