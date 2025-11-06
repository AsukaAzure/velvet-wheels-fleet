import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { z } from "zod";
import carSedanImg from "@/assets/car-sedan.jpg";
import carSuvImg from "@/assets/car-suv.jpg";
import carSportsImg from "@/assets/car-sports.jpg";
import carExoticImg from "@/assets/car-exotic.jpg";

const carSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  brand: z.string().min(2, "Brand must be at least 2 characters").max(50),
  segment: z.enum(["sedan", "suv", "sports", "exotic"]),
  description: z.string().max(500).optional(),
  price_per_day: z.number().positive("Price must be positive"),
  horsepower: z.number().positive().optional(),
  top_speed: z.number().positive().optional(),
  acceleration: z.string().max(20).optional(),
  image_url: z.string().url("Invalid image URL").max(2000).optional(),
});

const segmentImages: Record<string, string> = {
  sedan: carSedanImg,
  suv: carSuvImg,
  sports: carSportsImg,
  exotic: carExoticImg,
};

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    segment: "sedan",
    description: "",
    price_per_day: "",
    horsepower: "",
    top_speed: "",
    acceleration: "",
    image_url: "",
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!data) {
        toast.error("Admin access required");
        navigate("/");
      } else {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [navigate]);

  const { data: cars, isLoading } = useQuery({
    queryKey: ["adminCars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        carSchema.parse(data);
      } catch (error: any) {
        throw new Error(error.errors[0].message);
      }

      const carData = {
        ...data,
        image_url:
          data.image_url && data.image_url.trim() !== ""
            ? data.image_url.trim()
            : segmentImages[data.segment as keyof typeof segmentImages],
      };

      if (editingCar) {
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", editingCar.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cars").insert(carData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCars"] });
      toast.success(editingCar ? "Car updated!" : "Car added!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save car");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCars"] });
      toast.success("Car deleted!");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      segment: "sedan",
      description: "",
      price_per_day: "",
      horsepower: "",
      top_speed: "",
      acceleration: "",
      image_url: "",
    });
    setEditingCar(null);
  };

  const handleEdit = (car: any) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      brand: car.brand,
      segment: car.segment,
      description: car.description || "",
      price_per_day: car.price_per_day?.toString() || "",
      horsepower: car.horsepower?.toString() || "",
      top_speed: car.top_speed?.toString() || "",
      acceleration: car.acceleration || "",
      image_url: car.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name: formData.name,
      brand: formData.brand,
      segment: formData.segment,
      description: formData.description || null,
      price_per_day: parseFloat(formData.price_per_day),
      horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
      top_speed: formData.top_speed ? parseInt(formData.top_speed) : null,
      acceleration: formData.acceleration || null,
      image_url: formData.image_url?.trim() || null,
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-royal bg-clip-text text-transparent mb-8">
              Admin Dashboard
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Total Cars</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{cars?.length || 0}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Available Cars</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-500">
                    {cars?.filter(car => car.available).length || 0}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Booked Cars</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-orange-500">
                    {cars?.filter(car => !car.available).length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-gradient-royal hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Car
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {editingCar ? "Edit Car" : "Add New Car"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="segment">Segment *</Label>
                      <Select
                        value={formData.segment}
                        onValueChange={(value) => setFormData({ ...formData, segment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="exotic">Exotic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Day * ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price_per_day}
                        onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/car.jpg (optional)"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horsepower">Horsepower</Label>
                      <Input
                        id="horsepower"
                        type="number"
                        value={formData.horsepower}
                        onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topSpeed">Top Speed (mph)</Label>
                      <Input
                        id="topSpeed"
                        type="number"
                        value={formData.top_speed}
                        onChange={(e) => setFormData({ ...formData, top_speed: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acceleration">0-60 (sec)</Label>
                      <Input
                        id="acceleration"
                        value={formData.acceleration}
                        onChange={(e) => setFormData({ ...formData, acceleration: e.target.value })}
                        placeholder="e.g., 3.5s"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-royal hover:opacity-90">
                    {saveMutation.isPending ? "Saving..." : editingCar ? "Update Car" : "Add Car"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars?.map((car) => (
                <Card key={car.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <p className="text-xl">{car.name}</p>
                        <p className="text-sm text-muted-foreground font-normal">{car.brand}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(car)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(car.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Segment:</span> {car.segment}</p>
                      <p><span className="text-muted-foreground">Price:</span> ₹{car.price_per_day}/day</p>
                      {car.horsepower && <p><span className="text-muted-foreground">HP:</span> {car.horsepower}</p>}
                      {car.top_speed && <p><span className="text-muted-foreground">Top Speed:</span> {car.top_speed} mph</p>}
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <span className={car.available ? "text-green-500" : "text-orange-500"}>
                          {car.available ? "Available" : "Booked"}
                        </span>
                      </p>
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
