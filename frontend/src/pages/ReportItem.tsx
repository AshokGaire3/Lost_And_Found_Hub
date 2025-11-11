import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, Loader2, MapPin, ChevronRight } from "lucide-react";
import { z } from "zod";
import { useUserRole } from "@/hooks/useUserRole";

const itemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(3, "Location must be at least 3 characters").max(200),
  dateLostFound: z.string().min(1, "Please select a date"),
  contactInfo: z.string().max(200).optional(),
  color: z.string().max(50).optional(),
  venue: z.string().max(100).optional(),
  container: z.string().max(100).optional(),
  identifyingDetails: z.string().max(500).optional(),
  status: z.string().optional(),
  expiryDate: z.string().optional(),
});

interface FormFieldsProps {
  formData: {
    title: string;
    description: string;
    category: string;
    location: string;
    dateLostFound: string;
    contactInfo: string;
    color: string;
    venue: string;
    container: string;
    identifyingDetails: string;
    status?: string;
    expiryDate?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  imageFile: File | null;
  imagePreview: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isForLostItem?: boolean;
  isStaff?: boolean;
}

const FormFields = ({ formData, setFormData, imageFile, imagePreview, handleImageChange, isForLostItem = false, isStaff = false }: FormFieldsProps) => (
  <div className="space-y-4">
    {isStaff && (
      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status || "found"}
          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="found">Found</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}

    <div className="space-y-2">
      <Label htmlFor="title">Item Title *</Label>
      <Input
        id="title"
        placeholder="e.g., Black iPhone 13"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description *</Label>
      <Textarea
        id="description"
        placeholder="Provide detailed description..."
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        rows={4}
        required
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="keys">Keys</SelectItem>
            <SelectItem value="bags">Bags</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{isForLostItem ? "Lost Date" : "Date Found"} *</Label>
        <Input
          id="date"
          type="date"
          value={formData.dateLostFound}
          onChange={(e) => setFormData(prev => ({ ...prev, dateLostFound: e.target.value }))}
          required
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>

    {isStaff && (
      <div className="space-y-2">
        <Label htmlFor="expiryDate">Expiry Date (After Expire)</Label>
        <Input
          id="expiryDate"
          type="date"
          value={formData.expiryDate || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
          min={formData.dateLostFound || new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-muted-foreground">
          Items will expire after this date. Default is 30 days from found date.
        </p>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="location">{isForLostItem ? "Lost Location" : "Found Location"} *</Label>
        <Input
          id="location"
          placeholder="e.g., Library 3rd Floor"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue (Department/Location) {isStaff ? "*" : ""}</Label>
        <Select
          value={formData.venue}
          onValueChange={(value) => setFormData(prev => ({ ...prev, venue: value }))}
          required={isStaff}
        >
          <SelectTrigger id="venue">
            <SelectValue placeholder={isStaff ? "Select venue/department (required)" : "Select venue/department"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SU">Student Union (SU)</SelectItem>
            <SelectItem value="UC">University Center (UC)</SelectItem>
            <SelectItem value="Library">Library</SelectItem>
            <SelectItem value="GF">Griffin Hall (GF)</SelectItem>
            <SelectItem value="LA">Landrum Academic Center (LA)</SelectItem>
            <SelectItem value="Parking">Parking Area</SelectItem>
            <SelectItem value="Dining">Dining Services</SelectItem>
            <SelectItem value="Recreation">Recreation Center</SelectItem>
            <SelectItem value="Housing">Housing/Residence Hall</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Where the item is currently located or was found {isStaff ? "(Required for staff)" : ""}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          placeholder="e.g., Black, Blue, Red"
          value={formData.color}
          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="container">Container *</Label>
        <Input
          id="container"
          placeholder="e.g., Box A3, Shelf 2, Drawer 1"
          value={formData.container}
          onChange={(e) => setFormData(prev => ({ ...prev, container: e.target.value }))}
          required={isStaff}
        />
        <p className="text-xs text-muted-foreground">
          Physical storage location within the venue
        </p>
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="identifyingDetails">Identifying Details</Label>
      <Textarea
        id="identifyingDetails"
        placeholder="Any specific details that can help verify ownership (e.g., stickers, scratches, brand)"
        value={formData.identifyingDetails}
        onChange={(e) => setFormData(prev => ({ ...prev, identifyingDetails: e.target.value }))}
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="contact">Contact Info (Optional)</Label>
      <Input
        id="contact"
        placeholder="e.g., Room 205, Building A"
        value={formData.contactInfo}
        onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="image">Upload Image (Optional)</Label>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("image")?.click()}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {imageFile ? imageFile.name : "Choose Image"}
        </Button>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          className="mt-2 h-32 w-32 object-cover rounded-lg"
        />
      )}
    </div>
  </div>
);

interface SurveyStep {
  key: string;
  question: string;
  type: "select" | "text" | "textarea" | "date" | "location";
  placeholder?: string;
  optional?: boolean;
  options?: { value: string; label: string }[];
}

const ReportItem = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Define survey steps
  const surveySteps: SurveyStep[] = [
    {
      key: "category",
      question: "What category is your item?",
      type: "select",
      options: [
        { value: "electronics", label: "Electronics" },
        { value: "clothing", label: "Clothing" },
        { value: "accessories", label: "Accessories" },
        { value: "books", label: "Books" },
        { value: "keys", label: "Keys" },
        { value: "bags", label: "Bags" },
        { value: "documents", label: "Documents" },
        { value: "sports", label: "Sports" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "title",
      question: "What is the specific name of your item?",
      type: "text",
      placeholder: "e.g., iPhone 13, Black Leather Jacket",
    },
    {
      key: "description",
      question: "Describe your item in detail",
      type: "textarea",
      placeholder: "Provide detailed description...",
    },
    {
      key: "dateLostFound",
      question: "When did you lose/find it?",
      type: "date",
    },
    {
      key: "location",
      question: "Where did you lose/find it?",
      type: "location",
      placeholder: "e.g., Library 3rd Floor",
    },
    {
      key: "color",
      question: "What color is it? (optional)",
      type: "text",
      placeholder: "e.g., Black, Blue, Red",
      optional: true,
    },
  ];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    dateLostFound: "",
    contactInfo: "",
    color: "",
    venue: "",
    container: "",
    identifyingDetails: "",
    status: "found", // Default for staff
    expiryDate: "", // For staff to set expiry
    // Anonymous fields
    anonymousEmail: "",
    anonymousPhone: "",
    anonymousName: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        toast.success("Location detected!");
      },
      (error) => {
        toast.error("Unable to get your location");
        console.error(error);
      }
    );
  };

  // Predefined lost and found locations with coordinates
  const lostAndFoundLocations = [
    { name: "Student Union (SU)", value: "SU", lat: 40.1026, lng: -88.2318 },
    { name: "Library", value: "Library", lat: 40.1028, lng: -88.2279 },
    { name: "Griffin Hall (GF)", value: "GF", lat: 40.1019, lng: -88.2258 },
    { name: "Landrum Academic Center (LA)", value: "LA", lat: 40.1035, lng: -88.2290 },
    { name: "Parking Area", value: "Parking", lat: 40.1015, lng: -88.2300 },
  ];

  const getNearestLocations = () => {
    if (!userLocation) return [];

    const locationsWithDistance = lostAndFoundLocations.map((loc) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        loc.lat,
        loc.lng
      );
      return { ...loc, distance };
    });

    return locationsWithDistance.sort((a, b) => a.distance - b.distance);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleNextStep = () => {
    const currentStepData = surveySteps[currentStep];
    
    // Basic validation for non-optional fields
    if (!currentStepData.optional && !formData[currentStepData.key as keyof typeof formData]) {
      toast.error("Please answer this question to continue");
      return;
    }

    // Move to next step, even if it's the last step (which will show review)
    if (currentStep < surveySteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, userId: string | null = null) => {
    const fileExt = file.name.split(".").pop();
    const folder = userId || 'anonymous';
    const fileName = `${folder}/${Math.random()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("item-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("item-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent, status: "lost" | "found") => {
    e.preventDefault();

      // For staff reporting found items, require authentication
      if (status === "found" && !user) {
        toast.error("Please sign in as staff to report found items");
        navigate("/auth");
        return;
      }

      // For staff, ensure required fields are present
      if (user && role === "staff") {
        if (!formData.venue) {
          toast.error("Please select a venue/department");
          return;
        }
        if (!formData.container) {
          toast.error("Please enter a container location");
          return;
        }
      }

    // For students reporting lost items, allow anonymous reporting
    const isAnonymousReport = status === "lost" && !user;

    try {
      const validated = itemSchema.parse(formData);
      setLoading(true);

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user?.id || null);
      }

      // Prepare contact info
      let contactInfo = validated.contactInfo;
      if (isAnonymousReport) {
        // For anonymous reports, include email/phone/name in contact info
        const anonymousContact = [
          formData.anonymousName ? `Name: ${formData.anonymousName}` : null,
          formData.anonymousEmail ? `Email: ${formData.anonymousEmail}` : null,
          formData.anonymousPhone ? `Phone: ${formData.anonymousPhone}` : null,
          contactInfo || null
        ].filter(Boolean).join(" | ");
        contactInfo = anonymousContact || null;
      }

      // Calculate expiry date: 30 days from found date if not specified
      let expiryDate = null;
      if (status === "found" && formData.dateLostFound) {
        if (formData.expiryDate) {
          expiryDate = formData.expiryDate;
        } else {
          // Default to 30 days from found date
          const foundDate = new Date(formData.dateLostFound);
          foundDate.setDate(foundDate.getDate() + 30);
          expiryDate = foundDate.toISOString().split('T')[0];
        }
      }

      const itemData: any = {
        status: isStaff && formData.status ? formData.status : status,
        title: validated.title,
        description: validated.description,
        category: validated.category as any,
        location: validated.location,
        date_lost_found: validated.dateLostFound,
        contact_info: contactInfo,
        image_url: imageUrl,
        color: validated.color || null,
        venue: validated.venue || null,
        container: validated.container || null,
        identifying_details: validated.identifyingDetails || null,
        expiry_date: expiryDate,
      };

      // Add user_id and is_anonymous based on authentication status
      if (isAnonymousReport) {
        itemData.user_id = null;
        itemData.is_anonymous = true;
      } else {
        itemData.user_id = user.id;
        itemData.is_anonymous = false;
      }

      const { error } = await supabase.from("items").insert([itemData]);

      if (error) throw error;

      toast.success(
        user && role === "staff" 
          ? "Item added successfully!" 
          : `Item reported as ${status}! ${isAnonymousReport ? "Staff will review your report." : ""}`
      );
      
      // Navigate based on authentication and role
      if (user && role === "staff") {
        navigate("/admin?tab=items");
      } else if (isAnonymousReport) {
        navigate("/browse");
      } else {
        navigate("/my-items");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to report item");
      }
    } finally {
      setLoading(false);
    }
  };


  const renderAnonymousFields = () => {
    if (user) return null;
    
    return (
      <div className="space-y-4 pt-4 border-t">
        <p className="font-semibold text-sm">Your Contact Information *</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="anonymousName">Your Name *</Label>
            <Input
              id="anonymousName"
              placeholder="John Doe"
              value={formData.anonymousName}
              onChange={(e) => setFormData(prev => ({ ...prev, anonymousName: e.target.value }))}
              required={!user}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anonymousEmail">Email *</Label>
            <Input
              id="anonymousEmail"
              type="email"
              placeholder="your.email@example.com"
              value={formData.anonymousEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, anonymousEmail: e.target.value }))}
              required={!user}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="anonymousPhone">Phone Number</Label>
          <Input
            id="anonymousPhone"
            type="tel"
            placeholder="(123) 456-7890"
            value={formData.anonymousPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, anonymousPhone: e.target.value }))}
          />
        </div>
      </div>
    );
  };

  const renderSurveyStep = () => {
    const step = surveySteps[currentStep];
    const currentValue = formData[step.key as keyof typeof formData];

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">{step.question}</h3>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {surveySteps.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / surveySteps.length) * 100}%` }}
            />
          </div>

          {/* Render based on step type */}
          {step.type === "select" && step.options && (
            <Select
              value={currentValue || ""}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, [step.key]: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {step.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {step.type === "text" && step.key === "title" && (
            <div className="space-y-2">
              <Input
                value={currentValue || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, [step.key]: e.target.value }))
                }
                placeholder={step.placeholder}
              />
              {/* Show category-specific examples */}
              {formData.category && (
                <p className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> {(() => {
                    const examples: Record<string, string> = {
                      electronics: "iPhone 13, MacBook Pro, AirPods, Samsung Galaxy, iPad",
                      clothing: "Nike Jacket, Black Hoodie, Red Sweater, Blue Jeans",
                      accessories: "Apple Watch, Ray-Ban Sunglasses, Gucci Belt, Gold Necklace",
                      keys: "Car Keys with Fob, House Keys on Ring, U-Lock Key",
                      bags: "North Face Backpack, Coach Purse, Laptop Bag, Gym Bag",
                      documents: "Student ID, Driver's License, Passport, Credit Card",
                      sports: "Basketball, Tennis Racquet, Yoga Mat, Gym Water Bottle",
                      books: "Calculus Textbook, Moleskine Notebook, Physics Lab Manual",
                      other: "Please be specific about what the item is"
                    };
                    return examples[formData.category] || "";
                  })()}
                </p>
              )}
            </div>
          )}
          
          {step.type === "text" && step.key !== "title" && (
            <Input
              value={currentValue || ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, [step.key]: e.target.value }))
              }
              placeholder={step.placeholder}
            />
          )}

          {step.type === "textarea" && (
            <Textarea
              value={currentValue || ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, [step.key]: e.target.value }))
              }
              placeholder={step.placeholder}
              rows={4}
            />
          )}

          {step.type === "date" && (
            <Input
              type="date"
              value={currentValue || ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, [step.key]: e.target.value }))
              }
            />
          )}

          {step.type === "location" && (
            <div className="space-y-4">
              <Input
                value={currentValue || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, [step.key]: e.target.value }))
                }
                placeholder={step.placeholder}
              />
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="w-full"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Use My Location
                </Button>
              </div>

              {userLocation && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg space-y-2">
                  <p className="font-semibold text-sm">Nearest Lost & Found Locations:</p>
                  {getNearestLocations().slice(0, 3).map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, venue: loc.value, location: loc.name }));
                      }}
                      className="w-full text-left p-2 hover:bg-primary/20 rounded transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{loc.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {(loc.distance / 1000).toFixed(1)} km away
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={handlePreviousStep} className="flex-1">
              Previous
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNextStep}
            className={currentStep > 0 ? "flex-1" : "w-full"}
            disabled={!currentValue && !step.optional}
          >
            {currentStep === surveySteps.length - 1 ? "Review" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderFormReview = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold mb-4">Review Your Information</h3>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Category</p>
              <p className="text-lg capitalize">{formData.category}</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Title</p>
              <p className="text-lg">{formData.title}</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Description</p>
              <p className="text-lg">{formData.description}</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Date</p>
              <p className="text-lg">{formData.dateLostFound}</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Location</p>
              <p className="text-lg">{formData.venue ? `${formData.venue} - ${formData.location}` : formData.location}</p>
            </div>
            
            {formData.color && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Color</p>
                <p className="text-lg">{formData.color}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional fields */}
        <div className="space-y-4 pt-4 border-t">
          <Label htmlFor="container">Storage Container (optional)</Label>
          <Input
            id="container"
            placeholder="e.g., Box A3, Shelf 2"
            value={formData.container}
            onChange={(e) => setFormData(prev => ({ ...prev, container: e.target.value }))}
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="identifyingDetails">Identifying Details (optional)</Label>
          <Textarea
            id="identifyingDetails"
            placeholder="Any specific details that can help verify ownership"
            value={formData.identifyingDetails}
            onChange={(e) => setFormData(prev => ({ ...prev, identifyingDetails: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="image">Upload Image (Optional)</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {imageFile ? imageFile.name : "Choose Image"}
            </Button>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 h-32 w-32 object-cover rounded-lg"
            />
          )}
        </div>

        {renderAnonymousFields()}

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handlePreviousStep} className="flex-1">
            Back
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {user ? (role === "staff" ? "Add New Item" : "Report Lost Item") : "Report Your Lost Item"}
          </h1>
          <p className="text-muted-foreground">
            {user 
              ? (role === "staff" 
                  ? "Add a new item to the system. Fill in all required fields matching the items table structure."
                  : "Report your lost item to help us find it")
              : "No login required! Submit your lost item report and we'll help you find it."}
          </p>
        </div>

        {!user && (
          <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Student Access (No Login Required):</strong> You can report lost items without creating an account. 
              Staff will review your report and contact you if a match is found.
            </p>
          </div>
        )}

        {user && role === "staff" && (
          <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Staff Member:</strong> Add items with all required information: Status, Title, Description, 
              Venue (SU, UC, Parking, etc.), Container, Category, Found Location, and Date Found. 
              Expiry date defaults to 30 days from found date if not specified.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible to help identify the item
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roleLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : user && role === "staff" ? (
              <form onSubmit={(e) => handleSubmit(e, formData.status as "lost" | "found" || "found")} className="space-y-6 mt-4">
                <FormFields 
                  formData={formData}
                  setFormData={setFormData}
                  imageFile={imageFile}
                  imagePreview={imagePreview}
                  handleImageChange={handleImageChange}
                  isForLostItem={false}
                  isStaff={true}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Item...
                    </>
                  ) : (
                    "Add Item"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, "lost")} className="space-y-6 mt-4">
                {/* Show survey flow for lost items (anonymous users or students) */}
                {currentStep < surveySteps.length ? renderSurveyStep() : renderFormReview()}
                
                {currentStep >= surveySteps.length && (
                  <>
                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reporting...
                        </>
                      ) : (
                        "Submit Lost Item Report"
                      )}
                    </Button>
                    {!user && (
                      <p className="text-xs text-center text-muted-foreground">
                        💡 Want to track your items? <a href="/auth" className="text-primary underline">Sign in</a> for better tracking.
                      </p>
                    )}
                  </>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportItem;
