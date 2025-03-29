import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { modelFormSchema, type ModelFormData } from "@/lib/validators";
import { modelService, type Model } from "@/services/modelService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";

const specialtiesList = [
  "Runway",
  "Commercial",
  "Editorial",
  "Fitness",
  "Swimwear",
  "Lingerie",
  "Plus Size",
  "Petite",
  "Parts",
  "Promotional",
  "Fit",
];

export default function EditModelForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [model, setModel] = useState<Model | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: "",
      image: "",
      height: "",
      measurements: "",
      age: 18,
      status: "Available",
      location: "",
      specialties: [],
    },
  });

  useEffect(() => {
    const fetchModel = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const modelData = await modelService.getModelById(id);

        if (modelData) {
          setModel(modelData);
          setImageUrl(modelData.image);
          setSelectedSpecialties(modelData.specialties || []);

          // Reset form with model data
          reset({
            name: modelData.name,
            image: modelData.image,
            height: modelData.height,
            measurements: modelData.measurements,
            age: modelData.age,
            status: modelData.status,
            location: modelData.location,
            specialties: modelData.specialties,
          });
        }
      } catch (error) {
        console.error("Error fetching model:", error);
        toast({
          title: "Error",
          description: "Failed to load model data. Please try again.",
          variant: "destructive",
        });
        navigate("/admin/models");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModel();
  }, [id, navigate, reset, toast]);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setValue("image", url, { shouldValidate: true });
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) => {
      const newSpecialties = prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty];

      setValue("specialties", newSpecialties, { shouldValidate: true });
      return newSpecialties;
    });
  };

  const onSubmit = async (data: ModelFormData) => {
    if (!id || !model) return;

    try {
      setIsSubmitting(true);
      // Ensure specialties are included
      data.specialties = selectedSpecialties;

      await modelService.updateModel(id, data);

      toast({
        title: "Success",
        description: `${data.name}'s profile has been updated.`,
      });

      navigate("/admin/models");
    } catch (error: any) {
      console.error("Error updating model:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] pt-16 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading model data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/models")}
            className="mr-4 h-9 w-9 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit {model?.name}
          </h1>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Model Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      {...register("name")}
                      className={errors.name ? "border-red-300" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      placeholder="5'10&quot;"
                      {...register("height")}
                      className={errors.height ? "border-red-300" : ""}
                    />
                    {errors.height && (
                      <p className="text-sm text-red-500">
                        {errors.height.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurements">Measurements</Label>
                    <Input
                      id="measurements"
                      placeholder="34-24-34"
                      {...register("measurements")}
                      className={errors.measurements ? "border-red-300" : ""}
                    />
                    {errors.measurements && (
                      <p className="text-sm text-red-500">
                        {errors.measurements.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      placeholder="21"
                      {...register("age", { valueAsNumber: true })}
                      className={errors.age ? "border-red-300" : ""}
                    />
                    {errors.age && (
                      <p className="text-sm text-red-500">
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="New York, NY"
                      {...register("location")}
                      className={errors.location ? "border-red-300" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue(
                          "status",
                          value as "Available" | "Booked" | "On Hold",
                        )
                      }
                      defaultValue={model?.status}
                    >
                      <SelectTrigger
                        id="status"
                        className={errors.status ? "border-red-300" : ""}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500">
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Profile Image</Label>
                    <FileUpload
                      onUploadComplete={handleImageUpload}
                      defaultImageUrl={imageUrl}
                    />
                    {errors.image && (
                      <p className="text-sm text-red-500">
                        {errors.image.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Specialties</Label>
                    <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 bg-gray-50">
                      {specialtiesList.map((specialty) => (
                        <div
                          key={specialty}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={selectedSpecialties.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                          />
                          <Label
                            htmlFor={`specialty-${specialty}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.specialties && (
                      <p className="text-sm text-red-500">
                        {errors.specialties.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/models")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Update Model"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
