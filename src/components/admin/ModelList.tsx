import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Model, modelService } from "@/services/modelService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const ModelList = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await modelService.getModels();
      setModels(data);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error",
        description: "Failed to load models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/models/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!modelToDelete) return;

    try {
      await modelService.deleteModel(modelToDelete.id);
      setModels(models.filter((model) => model.id !== modelToDelete.id));
      toast({
        title: "Success",
        description: `${modelToDelete.name} has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting model:", error);
      toast({
        title: "Error",
        description: "Failed to delete model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setModelToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner text="Loading models..." />
      </div>
    );
  }

  return (
    <div>
      {models.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No models found
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first model.
          </p>
          <Button
            onClick={() => navigate("/admin/models/add")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add New Model
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {models.map((model) => (
            <Card
              key={model.id}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">
                        {model.name}
                      </h3>
                      <p className="text-gray-500">{model.location}</p>
                    </div>
                    <Badge
                      className={`${model.status === "Available" ? "bg-green-100 text-green-800" : model.status === "Booked" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
                    >
                      {model.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Height</span>
                      <p className="font-medium">{model.height}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Measurements</span>
                      <p className="font-medium">{model.measurements}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Age</span>
                      <p className="font-medium">{model.age}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {model.specialties.map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gray-50"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(model.id)}
                    className="h-9 w-9 rounded-full"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setModelToDelete(model)}
                    className="h-9 w-9 rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!modelToDelete}
        onOpenChange={() => setModelToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {modelToDelete?.name}'s profile and
              all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModelList;
