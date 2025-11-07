import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@supabase/supabase-js";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function Bookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            cars (*)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold mb-8 bg-gradient-royal bg-clip-text text-transparent">
            My Bookings
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : orders?.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-xl text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders?.map((order) => (
                <Card key={order.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={order.status === "pending" ? "default" : "secondary"}
                        className="text-sm"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {order.order_items.map((item: any) => (
                        <div 
                          key={item.id} 
                          className="flex gap-6 p-4 rounded-lg bg-background/50 border border-border"
                        >
                          <img 
                            src={item.cars.image_url} 
                            alt={item.cars.name}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-xl font-semibold">{item.cars.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.cars.brand}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-foreground">
                                    {new Date(item.pickup_date).toLocaleDateString()} - {new Date(item.return_date).toLocaleDateString()}
                                  </p>
                                  <p>{item.pickup_time} to {item.return_time}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                                <div>
                                  <p><span className="font-medium text-foreground">Pickup:</span> {item.pickup_location || "Not specified"}</p>
                                  <p><span className="font-medium text-foreground">Return:</span> {item.return_location || "Not specified"}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  <span className="font-medium text-foreground">Duration:</span> {item.rental_days} {item.rental_days === 1 ? 'day' : 'days'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 border-t border-border">
                              <div>
                                <span className="text-sm text-muted-foreground">Price per day: </span>
                                <span className="font-medium">₹{item.price_per_day}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Subtotal</p>
                                <p className="text-xl font-bold text-primary">₹{item.subtotal}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-end pt-4 border-t border-border">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                          <p className="text-3xl font-bold text-primary">₹{order.total_amount}</p>
                        </div>
                      </div>
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
